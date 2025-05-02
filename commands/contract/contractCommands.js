const { SlashCommandBuilder, SlashCommandSubcommandBuilder } = require("discord.js");
const { handleContractCreate } = require("./contract_create");

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
