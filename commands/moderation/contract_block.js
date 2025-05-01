const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("contract_block")
        .setDescription("Block a user from creating contracts"),
    async execute(interaction) {
        // TODO do stuff
        await interaction.reply("Pong")
    },
}
