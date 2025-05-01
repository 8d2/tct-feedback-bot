const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mod")
        .setDescription("Moderator commands")
        
        .addSubcommand(new SlashCommandBuilder()
            .setName("block")
            .setDescription("Blocks a user from creating feedback contracts")
            .addUserOption()
        ),

    async execute(interaction) {
        // TODO do stuff
        await interaction.reply(interaction.commandName)
    },
}
