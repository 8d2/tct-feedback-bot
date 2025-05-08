const { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption, MessageFlags, bold } = require("discord.js");

const userMethods = require("../../helpers/userMethods.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View the top 10 feedbackers with the most points"),

    async execute(interaction) {
        // Get a list of user ids which have data
        const listOfUserIds = await userMethods.getIdsWithInfo()

        // Loop through all ids and get their points
        var rawLeaderboardStats = {}
        for (var i = 0; i < listOfUserIds.length; i++) {
            const id = listOfUserIds[i]

            // Discard users with 0 points
            const points = await userMethods.getPoints(id)
            if (points > 0) {
                rawLeaderboardStats[id] = points
            }
        }
        
        // Order the dictionary by most to least points
        const sortedLeaderboardStats = Object.fromEntries(Object.entries(rawLeaderboardStats).sort((a, b) => b[1] - a[1]));

        // Create the contents of the leaderboard message
        var appendedLeaderboardMessage = ""
        var cycle = 0
        for (let userId in sortedLeaderboardStats) {
            cycle += 1
            var message = `${cycle}. <@${userId}> - ${sortedLeaderboardStats[userId]} points\n`

            // If the user appears on the leaderboard, make their entry bold
            if (userId == interaction.user.id) {
                message = bold(message)
            }

            appendedLeaderboardMessage += message
        }

        const responseEmbed = new EmbedBuilder()
            .setTimestamp()
            .setColor(Colors.Purple)
            .setDescription("## Leaderboard\n" + appendedLeaderboardMessage)
        await interaction.reply({embeds: [responseEmbed]});
    },
}
