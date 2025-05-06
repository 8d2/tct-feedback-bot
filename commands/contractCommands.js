const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, Colors, MessageFlags, CommandInteractionOptionResolver, inlineCode } = require("discord.js");

const { createContractMessage } = require("../handlers/contract");
const { subcommandExecute } = require("../handlers/commands.js")
const contractMethods = require("../helpers/contractMethods.js");
const userMethods = require("../helpers/userMethods.js");

// Constants
const CREATE_COMMAND_NAME = "create";
const GET_INFO_COMMAND_NAME = "getinfo";

const COMMAND_FUNCTIONS = {
    /**
     * Handles the `/contract create` subcommand.
     * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
     */
    [CREATE_COMMAND_NAME]: async function handleContractCreate(interaction) {
        // Check if the interaction occurred within a feedback thread
        const feedbackThread = await contractMethods.getFeedbackThreadFromInteraction(interaction);
        if (!feedbackThread) {
            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Red)
                .setDescription(`You can only use ${inlineCode(`/contract ${CREATE_COMMAND_NAME}`)} within feedback threads.`);
            
            await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral});
        }
        // Check if the user is blocked
        else if (userMethods.getIsBlocked(interaction.user.id)) {
            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Red)
                .setDescription("You have been blocked from creating feedback contracts for spam or abuse.");
            
            await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral});
        }
        else {
            // Component creation has been outsourced to handlers </3
            await interaction.reply(createContractMessage(interaction));
        }
    },

    /**
     * Handles the `/contract getinfo` subcommand.
     * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
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
        }
        else {
            const feedback_thread_owner_id = await contractMethods.getFeedbackThreadOwnerId(feedbackThread);

            const responseEmbed = new EmbedBuilder()
                .setTimestamp()
                .setColor(Colors.Blue)
                .setDescription(`Builder: <@${feedback_thread_owner_id}>`);

            await interaction.reply({embeds: [responseEmbed]});
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
        ),

    async execute(interaction) {
        subcommandExecute(interaction, COMMAND_FUNCTIONS, true);
    },
};
