const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, Colors, MessageFlags,
        CommandInteractionOptionResolver, SlashCommandBooleanOption, SlashCommandUserOption,
        bold, ButtonBuilder, ButtonStyle, ActionRowBuilder, HeadingLevel, inlineCode, heading }
        = require("discord.js");

const { createContractMessage } = require("../handlers/contract");
const { handleSubcommandExecute } = require("../handlers/commands.js")
const contractMethods = require("../helpers/contractMethods.js");
const userMethods = require("../helpers/userMethods.js");
const messageMethods = require("../helpers/messageMethods.js");
const collaboratorMethods = require("../helpers/collaboratorMethods.js");
const { getFeedbackChannel } = require("../helpers/settingsMethods.js");
const constants = require("../helpers/constants.js");
const { col } = require("sequelize");

// Constants
const CREATE_COMMAND_NAME = "create";
const GET_INFO_COMMAND_NAME = "getinfo";
const ALLOW_PINGS_COMMAND_NAME = "allowpings";
const ADD_BUILDER_COMMAND_NAME = "addbuilder";
const REMOVE_BUILDER_COMMAND_NAME = "removebuilder";

const USER_OPTION_NAME = "user";
const PING_OPTION_NAME = "ping";

const COLLABORATOR_LIMIT = 20;

const COMMAND_FUNCTIONS = {
    /**
     * Handles the `/contract create` subcommand.
     * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [CREATE_COMMAND_NAME]: async function handleContractCreate(interaction) {

        // Check if the interaction occurred within a feedback thread
        const feedbackThread = await contractMethods.getFeedbackThreadFromInteraction(interaction);
        // Check if user has read and accepted the rules
        const acceptedRules = await userMethods.getRulesAccepted(interaction.user.id)
        if (!feedbackThread) {
            contractMethods.showIncorrectChannelError(interaction);
            return false;
        }
        // Check if the user is a thread builder 
      /*  else if (await collaboratorMethods.getUserIsCollaborator(interaction.user, feedbackThread) == true) {
            contractMethods.showCommandError(
                interaction,
                "You cannot create feedback contracts since you are a builder in this thread."
            );
            return false;
        }*/
        // Check if the feedback thread is open for feedback
        else if (!(await contractMethods.isFeedbackEnabled(feedbackThread))) {
            contractMethods.showCommandError(
                interaction,
                "This feedback thread is not currently open for feedback contracts."
            );
            return false;
        }
        // Check if the user is blocked
        else if (await userMethods.getIsBlocked(interaction.user.id)) {
            contractMethods.showCommandError(
                interaction,
                "You have been blocked from creating feedback contracts for spam or abuse."
            );
            return false;
        }
        // Check if user has read and accepted the rules
        else if (!acceptedRules) {
            const messages = await messageMethods.getPointsInfoDisplayMessages(interaction);
            const rulesEmbed = new EmbedBuilder()
                .setDescription(messages[3])
                .setColor(Colors.Orange);
            const acceptButton = new ButtonBuilder()
                .setCustomId(constants.CONTRACT_RULES_ACCEPT_ID)
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success)
            const row = new ActionRowBuilder()
                .addComponents(acceptButton)
            
            const response = await interaction.reply({embeds: [rulesEmbed], components: [row], flags: MessageFlags.Ephemeral, withResponse: true});
            try {
                // Await for the response with a time limit
                const confirmation = await response.resource.message.awaitMessageComponent({ time: 600_000 });
                if (confirmation.customId === constants.CONTRACT_RULES_ACCEPT_ID) {
                    // Changes accepted_rules to true to stop this from triggering again
                    await userMethods.setRulesAccepted(interaction.user.id);

                    // Embed to use when under success
                    const updatedResponseEmbed = new EmbedBuilder()
                        .setTimestamp()
                        .setColor(Colors.Green)
                        .setDescription(
                            heading("Rules Accepted", HeadingLevel.Two) +
                            `\nRun the ${inlineCode("/contract create")} command again to get started!`)
                    await confirmation.update({embeds: [updatedResponseEmbed], components: [], flags: MessageFlags.Ephemeral});
                }
            }
            catch {
                // Embed to use when the interaction failed for whatever reason
                const failedResponseEmbed = new EmbedBuilder()
                    .setTimestamp()
                    .setColor(Colors.Red)
                    .setDescription(
                        heading("Cancelled", HeadingLevel.Two) +
                        `\nRules acknowledgement cancelled, you probably timed out or an unknown error occured. Run ${inlineCode("/contract create")} again.`
                    );
                await interaction.editReply({embeds: [failedResponseEmbed], components: [], flags: MessageFlags.Ephemeral});
            }
            return false;
        }
        else {
            // Component creation has been outsourced to handlers </3
            // Pings the thread owner if they have allow pings on.
            const threadOwner = await contractMethods.getFeedbackThreadOwner(feedbackThread);
            const userAllowsPings = await userMethods.getAllowPings(threadOwner.id);
            const pingUsers = userAllowsPings ? [threadOwner] : null;
            await interaction.reply(createContractMessage(interaction, pingUsers));
            return true;
        }
    },

    /**
     * Handles the `/contract getinfo` subcommand.
     * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [GET_INFO_COMMAND_NAME]: async function handleContractGetInfo(interaction) {
        // Check if the interaction occurred within a feedback thread
        const feedbackThread = await contractMethods.getFeedbackThreadFromInteraction(interaction);
        if (!feedbackThread) {
            contractMethods.showIncorrectChannelError(interaction);
            return false;
        }
        else {
            // TODO: make this command show a list of all builders
            const feedbackThreadOwner = await contractMethods.getFeedbackThreadOwner(feedbackThread);
            const feedbackEnabled = await contractMethods.isFeedbackEnabled(feedbackThread);
            const collaborators = await collaboratorMethods.getThreadCollaboratorUsers(feedbackThread);

            // Format list of collaborators message
            var collaboratorsMessage = ""
            if (collaborators.length == 0) {
                collaboratorsMessage = "No other users added!"
            }
            else {
                var count = 0
                for (let user of collaborators) {
                    count += 1

                    if (count == collaborators.length) {
                        collaboratorsMessage += `${user}`
                    }
                    else if (count == collaborators.length - 1) {
                        collaboratorsMessage += `${user} & `
                    }
                    else {
                        collaboratorsMessage += `${user}, `
                    }
                }
            }

            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Blue)
                .setDescription(
                    `Builder: ${feedbackThreadOwner}
                    Feedback Enabled: ${bold(`${feedbackEnabled}`)}
                    Collaborators: ${collaboratorsMessage}`
                );
            await interaction.reply({embeds: [responseEmbed]});
            return true;
        }
    },

    /**
     * Handles the `/contract allowpings` subcommand.
     * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [ALLOW_PINGS_COMMAND_NAME]: async function handleContractPingSettings(interaction) {
        const optionValue = interaction.options.getBoolean(PING_OPTION_NAME);
        const colorToDisplay = optionValue ? Colors.Green : Colors.Red;
        const messageToDisplay = optionValue ? constants.ALLOW_PINGS_MESSAGE_TRUE : constants.ALLOW_PINGS_MESSAGE_FALSE;
        
        userMethods.setAllowPings(interaction.user.id, optionValue)
        const responseEmbed = new EmbedBuilder()
            .setTimestamp()
            .setColor(colorToDisplay)
            .setDescription(messageToDisplay)
        
        await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral})
        return true;
    },
    
    [ADD_BUILDER_COMMAND_NAME]: async function handleContractAddBuilder(interaction) {
        
        const feedbackThread = await contractMethods.getFeedbackThreadFromInteraction(interaction);
        
        // Check if the interaction occurred within a feedback thread
        if (!feedbackThread) {
            contractMethods.showIncorrectChannelError(interaction);
            return false;
        }
        
        const feedbackThreadOwnerId = await contractMethods.getFeedbackThreadOwnerId(feedbackThread);
        const builderCount = await collaboratorMethods.getThreadCollaboratorCount(feedbackThread);
        
        // Check that the command user is the thread owner
        if (interaction.user.id != feedbackThreadOwnerId) {
            contractMethods.showCommandError(
                interaction,
                `Only the owner of this thread is allowed to add builders.`
            );
            return false;
        }
        // Check that the thread builder count is below the maximum
        else if (builderCount >= COLLABORATOR_LIMIT) {
            contractMethods.showCommandError(
                interaction,
                `This thread has reached the builder limit of ${COLLABORATOR_LIMIT}.`
            );
            return false;
        }
        else {
            const newBuilder = interaction.options.getUser(USER_OPTION_NAME);
            const addResult = await collaboratorMethods.addCollaboratorToThread(newBuilder, feedbackThread)
            
            if (addResult) {
                const responseEmbed = new EmbedBuilder().setTimestamp();
                responseEmbed.setColor(Colors.Green);
                responseEmbed.setDescription(`${newBuilder} has been added as a builder to this thread.`);
                await interaction.reply({embeds: [responseEmbed]});
                return true;
            }
            else {
                contractMethods.showCommandError(
                    interaction,
                    `${newBuilder} is already a builder in this thread.`
                );
                return false;
            }
        }
    },
    
    [REMOVE_BUILDER_COMMAND_NAME]: async function handleContractRemoveBuilder(interaction) {
        
        const feedbackThread = await contractMethods.getFeedbackThreadFromInteraction(interaction);
        
        // Check if the interaction occurred within a feedback thread
        if (!feedbackThread) {
            contractMethods.showIncorrectChannelError(interaction);
            return false;
        }
        
        const builder = interaction.options.getUser(USER_OPTION_NAME);
        const feedbackThreadOwnerId = await contractMethods.getFeedbackThreadOwnerId(feedbackThread);
        
        // Check that the command user is the thread owner
        if (interaction.user.id != feedbackThreadOwnerId) {
            contractMethods.showCommandError(
                interaction,
                `Only the owner of this thread is allowed to remove builders.`
            );
            return false;
        }
        // Check that the target user is not the thread owner
        else if (builder.id == feedbackThreadOwnerId) {
            contractMethods.showCommandError(
                interaction,
                `The owner of this thread cannot be removed as a builder.`
            );
            return false;
        }
        else {
            
            const removeResult = await collaboratorMethods.removeCollaboratorFromThread(builder, feedbackThread);
            
            if (removeResult) {
                const responseEmbed = new EmbedBuilder().setTimestamp();
                responseEmbed.setColor(Colors.Green);
                responseEmbed.setDescription(`${builder} has been removed as a builder for this thread.`);
                await interaction.reply({embeds: [responseEmbed]});
                return true;
            }
            else {
                contractMethods.showCommandError(
                    interaction,
                    `${builder} is not a builder for this thread.`
                );
                return false;
            }
        }
    },
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("contract")
        .setDescription("Feedback contract commands")
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(CREATE_COMMAND_NAME)
            .setDescription("Creates a feedback contract")
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(GET_INFO_COMMAND_NAME)
            .setDescription("Displays info about the current feedback thread")
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(ALLOW_PINGS_COMMAND_NAME)
            .setDescription("Change whether you will receive pings for contract related actions")
            .addBooleanOption(new SlashCommandBooleanOption()
                .setName(PING_OPTION_NAME)
                .setDescription("If true, you will be pinged for contract related actions")
                .setRequired(true)
            )
        )
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(ADD_BUILDER_COMMAND_NAME)
            .setDescription("Adds a user as a builder to this thread, allowing them to complete feedback contracts.")
            .addUserOption(new SlashCommandUserOption()
                .setName(USER_OPTION_NAME)
                .setDescription("The user to add as a builder")
                .setRequired(true)
            )
        )
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(REMOVE_BUILDER_COMMAND_NAME)
            .setDescription("Removes a user's builder status in this thread.")
            .addUserOption(new SlashCommandUserOption()
                .setName(USER_OPTION_NAME)
                .setDescription("The user to remove as a builder")
                .setRequired(true)
            )
        ),

    async execute(interaction) {
        handleSubcommandExecute(interaction, COMMAND_FUNCTIONS, true);
    },
};
