const { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandBooleanOption, MessageFlags, HeadingLevel, bold, heading }
    = require("discord.js");

const userMethods = require("../../helpers/userMethods.js")
const constants = require("../../helpers/constants.js")
const { pluralize } = require("../../helpers/util.js")

const HIDDEN_OPTION_NAME = "hidden"

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
        const listOfUsers = await userMethods.getUsersWithInfo(interaction.guild);

        // Loop through all users and get their points
        const leaderboardStats = [];
        for (let i = 0; i < listOfUsers.length; i++) {
            const user = listOfUsers[i]

            // Discard users with 0 points
            const points = await userMethods.getPoints(user.id)
            if (points > 0) {
                leaderboardStats.push({ user: user, points: points })
            }
        }

        // Order the stats by most to least points
        leaderboardStats.sort((a, b) => b.points - a.points);

        // Create the contents of the leaderboard message
        let appendedLeaderboardMessage = "";
        if (leaderboardStats == 0) {
            appendedLeaderboardMessage = constants.LEADERBOARD_EMPTY_MESSAGE;
        }
        else {
            let cycle = 0;
            for (const stat of leaderboardStats) {
                cycle += 1;
                const user = stat.user;
                let message = `${cycle}. ${user} - ${pluralize(stat.points, "point")}\n`;

                // If the user appears on the leaderboard, make their entry bold
                if (user == interaction.user) {
                    message = bold(message);
                }

                // If we havent reached the max amount to display
                if (cycle <= constants.LEADERBOARD_MAX_DISPLAY) {
                    appendedLeaderboardMessage += message;
                }
                // Stop displaying them unless the user appears in the data, append them separately at the bottom
                else if (user == interaction.user) {
                    if (cycle > constants.LEADERBOARD_MAX_DISPLAY + 1) {
                        // Other leaderboard entries before this one
                        appendedLeaderboardMessage += constants.LEADERBOARD_SEPARATOR + "\n";
                    }
                    appendedLeaderboardMessage += message;
                    if (cycle < leaderboardStats.length) {
                        // Other leaderboard entires after this one
                        appendedLeaderboardMessage += constants.LEADERBOARD_SEPARATOR;
                    }
                }
            }
        }

        const responseEmbed = new EmbedBuilder()
            .setTimestamp()
            .setColor(Colors.Purple)
            .setDescription(heading("Leaderboard", HeadingLevel.Two) + "\n" + appendedLeaderboardMessage);
        await interaction.reply({embeds: [responseEmbed], flags: flagsToAdd});
    },
}
