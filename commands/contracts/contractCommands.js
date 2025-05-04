const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { createContractMessage } = require("../../handlers/contract");

/**
 * Handles the `/contract create` subcommand.
 * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
 */
async function handleContractCreate(interaction) {

    // Component creation has been outsourced to handlers </3
    await interaction.reply(createContractMessage(interaction));

};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("contract")
        .setDescription("Feedback contract commands")
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("create")
            .setDescription("Creates a feedback contract")
        ),

    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case ("create"):
                handleContractCreate(interaction);
                break;
            default:
                return;
        }
    },
};
