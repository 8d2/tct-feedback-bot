const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, Colors, MessageFlags, CommandInteractionOptionResolver, inlineCode, SlashCommandBooleanOption } = require("discord.js");

const { createContractMessage } = require("../handlers/contract");
const { handleSubcommandExecute } = require("../handlers/commands.js")
const contractMethods = require("../helpers/contractMethods.js");
const userMethods = require("../helpers/userMethods.js");
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
        else if (userMethods.getIsBlocked(interaction.user.id)) {
            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Red)
                .setDescription("You have been blocked from creating feedback contracts for spam or abuse.");
            
            await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral});
            return false;
        }
        else {
            // Component creation has been outsourced to handlers </3
            // Pings the thread owner if they have allow pings on.
            const threadOwnerId = await contractMethods.getFeedbackThreadOwnerId(feedbackThread)
            const userAllowsPings = userMethods.getAllowPings(threadOwnerId)
            const pingId = userAllowsPings ? threadOwnerId: null;
            await interaction.reply(createContractMessage(interaction, pingId));
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
            const feedbackThreadOwnerId = await contractMethods.getFeedbackThreadOwnerId(feedbackThread);

            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Blue)
                .setDescription(`Builder: <@${feedbackThreadOwnerId}>`);

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
        const colorToDisplay = optionValue ? Colors.Green: Colors.Red;
        const messageToDisplay = optionValue ? constants.ALLOW_PINGS_MESSAGE_TRUE: constants.ALLOW_PINGS_MESSAGE_FALSE;
        
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
