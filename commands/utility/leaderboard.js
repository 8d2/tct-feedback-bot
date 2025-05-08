const { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption, MessageFlags } = require("discord.js");

const userMethods = require("../../helpers/userMethods.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View the top 10 feedbackers with the most points"),

    async execute(interaction) {

        const responseEmbed = new EmbedBuilder()
            .setTimestamp()
            .setColor(Colors.Purple)
            .setDescription("## Leaderboard\n")
        await interaction.reply({embeds: [responseEmbed]});
    },
}
