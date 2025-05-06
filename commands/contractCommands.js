const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, Colors, MessageFlags, CommandInteractionOptionResolver, inlineCode, SlashCommandBooleanOption } = require("discord.js");

const { createContractMessage } = require("../handlers/contract");
const { subcommandExecute } = require("../handlers/commands.js")
const contractMethods = require("../helpers/contractMethods.js");
const userMethods = require("../helpers/userMethods.js");

// Constants
const CREATE_COMMAND_NAME = "create";
const GET_INFO_COMMAND_NAME = "getinfo";

const PING_OPTION_NAME = "ping";

const COMMAND_FUNCTIONS = {
    /**
     * Handles the `/contract create` subcommand.
     * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [CREATE_COMMAND_NAME]: async function handleContractCreate(interaction) {
        const ping_thread_owner = interaction.options.getBoolean(PING_OPTION_NAME);

        // Check if the interaction occurred within a feedback thread
        const feedbackThread = await contractMethods.getFeedbackThreadFromInteraction(interaction);
        if (!feedbackThread) {
            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Red)
                .setDescription(`You can only use ${inlineCode(`/contract ${CREATE_COMMAND_NAME}`)} within feedback threads.`);
            
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
            // Pings the thread owner if that option is set to true
            const ping_id = ping_thread_owner ? await contractMethods.getFeedbackThreadOwnerId(feedbackThread) : null;
            await interaction.reply(createContractMessage(interaction, ping_id));
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
            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Red)
                .setDescription(`You can only use ${inlineCode(`/contract ${GET_INFO_COMMAND_NAME}`)} within feedback threads.`);
            
            await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral});
            return false;
        }
        else {
            const feedback_thread_owner_id = await contractMethods.getFeedbackThreadOwnerId(feedbackThread);

            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Blue)
                .setDescription(`Builder: <@${feedback_thread_owner_id}>`);

            await interaction.reply({embeds: [responseEmbed]});
            return true;
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
            .addBooleanOption(new SlashCommandBooleanOption()
                .setName(PING_OPTION_NAME)
                .setDescription("If true, pings the owner of the feedback thread")
                .setRequired(false)
            )
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(GET_INFO_COMMAND_NAME)
            .setDescription("Displays info about the current feedback thread")
        ),

    async execute(interaction) {
        subcommandExecute(interaction, COMMAND_FUNCTIONS, true);
    },
};
