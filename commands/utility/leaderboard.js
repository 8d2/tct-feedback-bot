const { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandBooleanOption, MessageFlags, bold } = require("discord.js");

const userMethods = require("../../helpers/userMethods.js")

const HIDDEN_OPTION_NAME = "hidden"

const maxDisplay = 10

module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View the top 10 feedbackers with the most points")
        .addBooleanOption(new SlashCommandBooleanOption()
                .setName(HIDDEN_OPTION_NAME)
                .setDescription("If true, the leaderboard will only be visible to you")
                .setRequired(false)
        ),

    async execute(interaction) {
        // Logic for hiding the leaderboard if true
        const hiddenValue = interaction.options.getBoolean(HIDDEN_OPTION_NAME);
        const flagsToAdd = hiddenValue ? MessageFlags.Ephemeral : [];

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

            // If we havent reached the max amount to display
            if (cycle <= maxDisplay) {
                appendedLeaderboardMessage += message
            }
            // Stop displaying them unless the user appears in the data, append them separately at the bottom
            else if (userId == interaction.user.id) {
                appendedLeaderboardMessage += "‧‧‧\n" + message
            }
        }

        const responseEmbed = new EmbedBuilder()
            .setTimestamp()
            .setColor(Colors.Purple)
            .setDescription("## Leaderboard\n" + appendedLeaderboardMessage)
        await interaction.reply({embeds: [responseEmbed], flags: flagsToAdd});
    },
}
