const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, Colors, MessageFlags, CommandInteractionOptionResolver, inlineCode, SlashCommandBooleanOption, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

const { createContractMessage } = require("../handlers/contract");
const { handleSubcommandExecute } = require("../handlers/commands.js")
const contractMethods = require("../helpers/contractMethods.js");
const userMethods = require("../helpers/userMethods.js");
const messageMethods = require("../helpers/messageMethods.js")
const { getFeedbackChannelId } = require("../helpers/settingsMethods.js");
const constants = require("../helpers/constants.js")

// Constants
const CREATE_COMMAND_NAME = "create";
const GET_INFO_COMMAND_NAME = "getinfo";
const ALLOW_PINGS_COMMAND_NAME = "allowpings";

const PING_OPTION_NAME = "ping";

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
            // Get the actual feedback thread ID to include in the error message
            const realFeedbackThread = await getFeedbackChannelId();

            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Red)
                .setDescription(`You can only use ${inlineCode(`/contract ${CREATE_COMMAND_NAME}`)} within <#${realFeedbackThread}>.`);
            
            await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral});
            return false;
        }
        // Check if the user is blocked
        else if (await userMethods.getIsBlocked(interaction.user.id)) {
            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Red)
                .setDescription("You have been blocked from creating feedback contracts for spam or abuse.");
            
            await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral});
            return false;
        }
        // Check if user has read and accepted the rules
        else if (!acceptedRules) {
            const messages = await messageMethods.getPointsInfoDisplayMessages(interaction);
            const rulesEmbed = new EmbedBuilder()
                .setDescription(messages[3])
                .setColor(Colors.Orange);
            const acceptButton = new ButtonBuilder()
                .setCustomId("accept")
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success)
            const row = new ActionRowBuilder()
                .addComponents(acceptButton)
            
            const response = await interaction.reply({embeds: [rulesEmbed], components: [row], flags: MessageFlags.Ephemeral, withResponse: true});
            try {
                // Await for the response with a time limit
                const confirmation = await response.resource.message.awaitMessageComponent({ time: 600_000 });
                if (confirmation.customId === "accept") {
                    // Changes accepted_rules to true to stop this from triggering again
                    await userMethods.setRulesAccepted(interaction.user.id);

                    // Embed to use when under success
                    const updatedResponseEmbed = new EmbedBuilder()
                        .setTimestamp()
                        .setColor(Colors.Green)
                        .setDescription("## Rules accepted \n Run the `/contract create` command again to get started!")
                    await confirmation.update({embeds: [updatedResponseEmbed], components: [], flags: MessageFlags.Ephemeral})
                }
            } catch {
                // Embed to use when the interaction failed for whatever reason
                const failedResponseEmbed = new EmbedBuilder()
                        .setTimestamp()
                        .setColor(Colors.Red)
                        .setDescription("## Cancelled \n Rules acknowledgement cancelled, you probably timed out or an unknown error occured. Run `/contract create` again.")
                await interaction.editReply({embeds: [failedResponseEmbed], components: [], flags: MessageFlags.Ephemeral});
            }
            return false;
        }
        else {
            // Component creation has been outsourced to handlers </3
            // Pings the thread owner if they have allow pings on.
            const threadOwner = (await contractMethods.getFeedbackThreadOwner(feedbackThread)).user;
            const userAllowsPings = await userMethods.getAllowPings(threadOwner.id);
            console.log(threadOwner);
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
            // Get the actual feedback thread ID to include in the error message
            const realFeedbackThread = await getFeedbackChannelId();

            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Red)
                .setDescription(`You can only use ${inlineCode(`/contract ${GET_INFO_COMMAND_NAME}`)} within <#${realFeedbackThread}>.`);
            
            await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral});
            return false;
        }
        else {
            const feedbackThreadOwner = await contractMethods.getFeedbackThreadOwner(feedbackThread);

            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Blue)
                .setDescription(`Builder: ${feedbackThreadOwner}`);

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
            .setDescription("Change whether you will receive pings on contract creation")
            .addBooleanOption(new SlashCommandBooleanOption()
                .setName(PING_OPTION_NAME)
                .setDescription("If true, you will be pinged when a contract is created in your thread")
                .setRequired(true)
            )
        ),

    async execute(interaction) {
        handleSubcommandExecute(interaction, COMMAND_FUNCTIONS, true);
    },
};
