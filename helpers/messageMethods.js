// For bot related messages
const { heading, bold, italic, inlineCode, HeadingLevel } = require("discord.js");

const { getDatabaseRoles } = require('./settingsMethods.js');
const { getGainedRoles } = require('./userMethods.js');
const { pluralize, concatList } = require('./util.js');

/**
 * Gets a message that displays what contract rating gives what points.
 * @returns {string} Message to display.
 */
function getRatingPointsMessage() {
    return "- :bomb: - 0 points\n" +
            "- :star: - 1 point\n" +
            "- :star::star: - 2 points\n" +
            "- :star::star::star: - 3 points";
}

/**
 * Gets a message that describes requirements for each feedback role.
 * @param {import('discord.js').Interaction} interaction The interaction using this message.
 * @param {boolean} displayRoleType If true, the role type for each role is displayed. 
 * @returns {string} Message to display.
 */
async function getRoleRequirementMessage(interaction, displayRoleType = false) {
    let message = "";
    const roles = await getDatabaseRoles();
    roles.forEach((role, index) => {
        const guildRole = interaction.guild.roles.cache.get(role.role_id);
        message += `- ${displayRoleType ? `${role.role_type}: ` : ""}${guildRole} - ${pluralize(role.role_requirement, "point")}`;
        if (index != roles.length - 1) {
            message += "\n";
        }
    });
    return message;
}

/**
 * Gets a message that displays info about feedback points.
 * @param {import('discord.js').Interaction} interaction The interaction using this message.
 * @returns {[string]} Messages to display, by category.
 */
async function getPointsInfoDisplayMessages(interaction) {
    // Array of strings for each embed
    return [
        heading("Feedback Guidelines:", HeadingLevel.One) +
        `\nWhen making a tower, one of the most important things is getting player feedback. Here's some steps on how to use our ${interaction.client.user} to streamline the process!`,

        // Use + concat because using `` multiline string breaks the headers
        heading("Getting Feedback:", HeadingLevel.Two) +
        `\n${inlineCode("1. Create a feedback post")} - Include the name of your tower, intended difficulty or anything else to know!\n` +
        `${inlineCode("2. Add \"open for feedback\" tag when you're ready for feedback")} - This will allow feedbackers to create feedback contracts, where they can claim rewards for giving you feedback.\n` +
        `${inlineCode("3. Rate contracts appropriately")} - When a feedback contract is made, give it an appropriate score from the dropdown. ${italic("Please try to be accurate and as fair as possible!")}\n` +
        heading("Other Helpful Commands:", HeadingLevel.Three) +
        `\n- ${inlineCode("/contract addbuilder")} + ${inlineCode("/contract removebuilder")} - Add or remove collaborators to be able to accept contracts for you.\n` +
        `- ${inlineCode("/contract allowpings")} - Toggles whether you will be pinged when a contract you need to accept is posted.\n` +
        `- ${inlineCode("/contract getinfo")} - Get info about the tower's builders.`,

        heading("Giving Feedback:", HeadingLevel.Two) +
        `\nAfter giving a tower feedback, run the ${inlineCode("/contract create")} command in the thread. The builder will then rate your feedback, which will give you ${italic("feedback points")}:\n` +
        `${getRatingPointsMessage()}\n\n` +
        bold("If you get enough feedback points, you can earn exclusive roles:") +
        `\n${await getRoleRequirementMessage(interaction)}`,

        heading("Rules:", HeadingLevel.Two) +
        "\nThis bot is a powerful tool for giving and receiving feedback and as such, we have the power to punish those who misuse it. Along with common sense, here is a list of DONTS:\n" +
        "- DONT submit empty feedback\n" +
        "- DONT be unfair/biased when feedbacking\n" +
        "- DONT offer bribes (robux, feedback, etc) in return for positive feedback\n" +
        bold("If you are found to be breaking these rules or abusing the bot in any other way, we will block you from using the bot, denying your ability to make feedback contracts and receive feedback points.") +
        "\n\n" +
        italic("Happy feedbacking!")
    ];
}

/**
 * Gets a message listing all the roles gained going from `originalPoints` to `newPoints`.
 * @param {import("discord.js").Interaction} interaction The interaction to get gained roles message from.
 * @param {int} originalPoints The original points amount.
 * @param {int} newPoints The new points amount.
 * @return {string?} Roles gained, or null if no roles were gained.
 */
async function getGainedRolesMessage(interaction, originalPoints, newPoints) {
    const gainedRoles = await getGainedRoles(interaction, originalPoints, newPoints);
    return concatList(gainedRoles, null);
}

/**
 * Get the original user who supplied the root of this interaction.
 * @param {import('discord.js').Interaction} interaction The interaction to analyze.
 * @returns {User} The original root of this interaction.
 */
function getOriginalUser(interaction) {
    if (interaction.message) {
        // Previous message exists, get interaction for previous user
        return interaction.message.interactionMetadata.user;
    }
    // No previous message, first time interaction
    return interaction.user;
}

/**
 * Gets the options to use for an author from the user.
 * @param {User} user The user to make the author.
 * @returns {EmbedAuthorOptions} The author to use.
 */
function getAuthorOptions(user) {
    return {
        name: user.username, 
        iconURL: user.avatarURL(),
    };
}

/**
 * Responds to an interaction with an error embed with the given description.
 * @param {CommandInteraction} the command that generated this interaction
 * @param {string} the description to use in the embed
 */
async function showCommandError(interaction, description) {
    const responseEmbed = new EmbedBuilder()
        .setTimestamp()
        .setColor(Colors.Red)
        .setDescription(description);
            
    await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral});
}

module.exports = {
    getRatingPointsMessage,
    getRoleRequirementMessage,
    getPointsInfoDisplayMessages,
    getGainedRolesMessage,
    getOriginalUser,
    getAuthorOptions,
    showCommandError
}