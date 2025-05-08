const { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandBooleanOption, MessageFlags, bold } = require("discord.js");

const userMethods = require("../../helpers/userMethods.js")

const HIDDEN_OPTION_NAME = "hidden"

const MAX_DISPLAY = 10

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

        // Get a list of users which have data
        const listOfUsers = await userMethods.getUsersWithInfo()

        // Loop through all users and get their points
        var rawLeaderboardStats = {}
        for (var i = 0; i < listOfUsers.length; i++) {
            const user = listOfUsers[i]

            // Discard users with 0 points
            const points = await userMethods.getPoints(user.id)
            if (points > 0) {
                rawLeaderboardStats[user] = points
            }
        }
        
        // Order the dictionary by most to least points
        const sortedLeaderboardStats = Object.fromEntries(Object.entries(rawLeaderboardStats).sort((a, b) => b[1] - a[1]));

        // Create the contents of the leaderboard message
        var appendedLeaderboardMessage = ""
        var cycle = 0
        for (let user in sortedLeaderboardStats) {
            cycle += 1
            var message = `${cycle}. ${user} - ${sortedLeaderboardStats[user]} points\n`

            // If the user appears on the leaderboard, make their entry bold
            if (user == interaction.user) {
                message = bold(message)
            }

            // If we havent reached the max amount to display
            if (cycle <= MAX_DISPLAY) {
                appendedLeaderboardMessage += message
            }
            // Stop displaying them unless the user appears in the data, append them separately at the bottom
            else if (user == interaction.user) {
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
