const { ActionRowBuilder, bold, ButtonBuilder, ButtonStyle, Colors, CommandInteraction,
    EmbedBuilder, inlineCode, MessageFlags, messageLink, SlashCommandBooleanOption, 
    SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption }
    = require("discord.js");

const { createContractMessage } = require("../handlers/contract");
const { handleSubcommandExecute } = require("../handlers/commands.js")
const contractMethods = require("../helpers/contractMethods.js");
const userMethods = require("../helpers/userMethods.js");
const { getPointsInfoDisplayMessages, showCommandError } = require("../helpers/messageMethods.js");
const collaboratorMethods = require("../helpers/collaboratorMethods.js");
const constants = require("../helpers/constants.js");
const { concatList, getTimeDisplay } = require('../helpers/util.js');
const threadUserMethods = require("../helpers/threadUserMethods.js");

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
     * @param {CommandInteraction} interaction The interaction that used this command.
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [CREATE_COMMAND_NAME]: async function handleContractCreate(interaction) {

        // Check if the interaction occurred within a feedback thread
        const feedbackThread = await contractMethods.getFeedbackThreadFromInteraction(interaction);
        if (!feedbackThread) {
            contractMethods.showIncorrectChannelError(interaction);
            return false;
        }

        // Check if the user is a thread builder 
        if (await collaboratorMethods.getUserIsCollaborator(interaction.user, feedbackThread) == true) {
            showCommandError(
                interaction,
                "You cannot create feedback contracts since you are a builder in this thread."
            );
            return false;
        }

        // Check if the feedback thread is open for feedback
        if (!(await contractMethods.isFeedbackEnabled(feedbackThread))) {
            showCommandError(
                interaction,
                "This feedback thread is not currently open for feedback contracts."
            );
            return false;
        }

        // Check if the user is blocked
        if (await userMethods.getIsBlocked(interaction.user.id)) {
            showCommandError(
                interaction,
                "You have been blocked from creating feedback contracts for spam or abuse."
            );
            return false;
        }

        // Check if the user still has an active contract cooldown in the thread
        const cooldownRemainingSeconds = await threadUserMethods.getThreadUserCooldown(feedbackThread.id, interaction.user.id);
        if (cooldownRemainingSeconds > 0) {
            showCommandError(
                interaction,
                `You have an active contract cooldown in this thread. Please wait ${inlineCode(getTimeDisplay(cooldownRemainingSeconds))} before attempting to post another contract.`
            );
            return false;
        }

        // Check if the user still has an active/unfulfilled contract in the thread
        const activeContractMessageId = await threadUserMethods.getActiveContractMessageId(feedbackThread.id, interaction.user.id);
        if (activeContractMessageId) {
            const contractLink = messageLink(feedbackThread.id, activeContractMessageId, interaction.guildId);
            showCommandError(
                interaction,
                `You have an active contract in this thread: 
                ${contractLink}
                It must be fulfilled before you can create a new contract.`
            );
            return false;
        }

        // Check if user has read and accepted the rules
        const acceptedRules = await userMethods.getRulesAccepted(interaction.user.id)
        if (!acceptedRules) {
            const messages = await getPointsInfoDisplayMessages(interaction);
            const rulesEmbed = new EmbedBuilder()
                .setDescription(messages[3])
                .setColor(Colors.Orange);
            const acceptButton = new ButtonBuilder()
                .setCustomId(constants.CONTRACT_RULES_ACCEPT_ID)
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success);
            const row = new ActionRowBuilder()
                .addComponents(acceptButton);
            
            await interaction.reply({embeds: [rulesEmbed], components: [row], flags: MessageFlags.Ephemeral, withResponse: true});
            return false;
        }

        // Passed all checks, make a contract!
        else {
            // Pings the thread collaborators if they have allow pings on.
            const collaborators = await collaboratorMethods.getThreadCollaboratorUsers(feedbackThread, false);
            const usersToPing = []
            for (let user of collaborators) {
                const userAllowsPings = await userMethods.getAllowPings(user.id);
                if (userAllowsPings) {
                    usersToPing.push(user)
                }
            }

            // Resets the user's contract cooldown timer
            await threadUserMethods.setLastContractPosted(feedbackThread.id, interaction.user.id);

            // Finally, reply with the contract message
            await interaction.reply(createContractMessage(interaction, usersToPing));

            // Cache the contract message ID
            const contractMessage = await interaction.fetchReply();
            const messageId = contractMessage.id;
            await threadUserMethods.setActiveContractMessageId(feedbackThread.id, interaction.user.id, messageId);
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
            const feedbackThreadOwner = await contractMethods.getFeedbackThreadOwner(feedbackThread);
            const feedbackEnabled = await contractMethods.isFeedbackEnabled(feedbackThread);
            const collaborators = await collaboratorMethods.getThreadCollaboratorUsers(feedbackThread, true);

            // Format list of collaborators message + respond
            const collaboratorsMessage = concatList(collaborators, "No other users added!");
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
            showCommandError(
                interaction,
                `Only the owner of this thread is allowed to add builders.`
            );
            return false;
        }
        // Check that the thread builder count is below the maximum
        else if (builderCount >= COLLABORATOR_LIMIT) {
            showCommandError(
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
                showCommandError(
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
            showCommandError(
                interaction,
                `Only the owner of this thread is allowed to remove builders.`
            );
            return false;
        }
        // Check that the target user is not the thread owner
        else if (builder.id == feedbackThreadOwnerId) {
            showCommandError(
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
                showCommandError(
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
