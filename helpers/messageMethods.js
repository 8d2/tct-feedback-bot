// For bot related messages

const { getRoles } = require('./settingsMethods.js');
const { pluralize } = require('./util.js');

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
    const roles = await getRoles();
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
        "# Feedback Guidelines\n" +
        `When making a tower, one of the most important things is getting player feedback. Here's some steps on how to use our ${interaction.client.user} to streamline the process!`,

        // Use + concat because using `` multiline string breaks the headers
        `## Getting Feedback:\n`+
        "`1. Create a feedback post` - Include the name of your tower, intended difficulty or anything else to know!\n" +
        "`2. Add \"open for feedback\" tag when you're ready for feedback` - This will allow feedbackers to create feedback contracts, where they can claim rewards for giving you feedback.\n" +
        "\`3. Rate contracts appropriately\` - When a feedback contract is made, give it an appropriate score from the dropdown. *Please try to be accurate and as fair as possible!*\n" +
        "### Other Helpful Commands:\n" +
        "- `/contract addbuilder` + `/contract removebuilder` - Add or remove collaborators to be able to accept contracts for you.\n" +
        "- `/contract allowpings` - Toggles whether you will be pinged when a contract you need to accept is posted." +
        "- `/contract getinfo` - Get info about the tower's builders.",

        "## Giving Feedback:\n" +
        "After giving a tower feedback, run the `/contract create` command in the thread. The builder will then rate your feedback, which will give you *feedback points*:\n" +
        `${getRatingPointsMessage()}\n\n` +
        "**If you get enough feedback points, you can earn exclusive roles:**\n" +
        `${await getRoleRequirementMessage(interaction)}`,

        "## Rules:\n" +
        "This bot is a powerful tool for giving and receiving feedback and as such, we have the power to punish those who misuse it. Along with common sense, here is a list of DONTS:\n" +
        "- DONT submit empty feedback\n" +
        "- DONT be unfair/biased when feedbacking\n" +
        "- DONT offer bribes (robux, feedback, etc) in return for positive feedback\n" +
        "**If you are found to be breaking these rules or abusing the bot in any other way, we will block you from using the bot, denying your ability to make feedback contracts and receive feedback points.**\n\n" +
        "*Happy feedbacking!*"
    ];
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

module.exports = {
    getRatingPointsMessage,
    getRoleRequirementMessage,
    getPointsInfoDisplayMessages,
    getOriginalUser
}