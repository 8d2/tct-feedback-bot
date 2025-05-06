const { ThreadChannel } = require('discord.js');
const { getFeedbackChannelId } = require('./settingsMethods');

/**
 * Gets whether an interaction occurred within a feedback thread. Returns the
 * feedback thread, or `null` if the interaction happened outside of a
 * designated feedback thread.
 * @param {import('discord.js').Interaction} interaction The interaction.
 * @returns {ThreadChannel?} The feedback thread if it exists, or null if invalid.
 */
async function getFeedbackThreadFromInteraction(interaction) {
    const feedback_channel_id = await getFeedbackChannelId();
    if (interaction.channel.parentId != feedback_channel_id) return null;
    return interaction.channel;
}

/**
 * Gets the owner ID of a feedback thread or `null` if not a feedback thread.
 * @param {ThreadChannel} thread The thread.
 * @returns {string?} The user ID of the thread owner.
 */
async function getFeedbackThreadOwnerId(thread) {
    const feedback_channel_id = await getFeedbackChannelId();
    if (thread.parentId != feedback_channel_id) return null;
    return thread.ownerId;
}

module.exports = {
    getFeedbackThreadFromInteraction,
    getFeedbackThreadOwnerId,
}