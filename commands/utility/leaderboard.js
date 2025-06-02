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
                const ranCommand = stat.user == interaction.user;

                // Display a message for this user if they are in the top spots, or ran the command.
                if (cycle <= constants.LEADERBOARD_MAX_DISPLAY || ranCommand) {
                    let message = `${cycle}. ${stat.user} - ${pluralize(stat.points, "pt")}\n`;

                    // If showing user who ran this command, make them bold.
                    if (ranCommand) {
                        message = bold(message);

                        // Add separator if there are other hidden entries between the last top spot and this one.
                        if (cycle > constants.LEADERBOARD_MAX_DISPLAY + 1) {
                            appendedLeaderboardMessage += constants.LEADERBOARD_SEPARATOR + "\n";
                        }
                    }

                    // Append entry for this user.
                    appendedLeaderboardMessage += message;

                    // Add separator if there are other hidden entries after this one.
                    if (ranCommand && cycle < leaderboardStats.length) {
                        appendedLeaderboardMessage += constants.LEADERBOARD_SEPARATOR;
                        break;
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
