const { ThreadChannel, Client } = require('discord.js');
const { getFeedbackChannelId, getFeedbackForumTagId } = require('./settingsMethods');

/**
 * Gets the list of tags that are applicable within the feedback
 * forum channel.
 * @returns {import('discord.js').GuildForumTag[]} A list of tags that can be used in the forum channel.
 */
async function getFeedbackForumTags() {
    const feedbackChannelId = await getFeedbackChannelId();
    if (!feedbackChannelId) return [];

    // Temporarily create a new client to get the channel by id (scuffed workaround)
    const client = new Client();
    const feedbackChannel = client.channels.cache.get(feedbackChannelId);
    return feedbackChannel.availableTags ?? [];
}

/**
 * Returns `true` if the thread has the "open for feedback" tag.
 * @param {ThreadChannel} thread The thread.
 * @returns {boolean} True if the thread is open for feedback.
 */
async function getFeedbackThreadEnabled(thread) {
    const feedbackForumTags = thread.appliedTags;
    const feedbackEnabledTag = await getFeedbackForumTagId();
    if (!feedbackEnabledTag) return false;
    return feedbackForumTags.includes(feedbackEnabledTag);
}

/**
 * Gets whether an interaction occurred within a feedback thread. Returns the
 * feedback thread, or `null` if the interaction happened outside of a
 * designated feedback thread.
 * @param {import('discord.js').Interaction} interaction The interaction.
 * @returns {ThreadChannel?} The feedback thread if it exists, or null if invalid.
 */
async function getFeedbackThreadFromInteraction(interaction) {
    const feedbackChannelId = await getFeedbackChannelId();
    if (interaction.channel.parentId != feedbackChannelId) return null;
    return interaction.channel;
}

/**
 * Gets the owner ID of a feedback thread or `null` if not a feedback thread.
 * @param {ThreadChannel} thread The thread.
 * @returns {string?} The user ID of the thread owner.
 */
async function getFeedbackThreadOwnerId(thread) {
    const feedbackChannelId = await getFeedbackChannelId();
    if (thread.parentId != feedbackChannelId) return null;
    return thread.ownerId;
}

module.exports = {
    getFeedbackForumTags,
    getFeedbackThreadEnabled,
    getFeedbackThreadFromInteraction,
    getFeedbackThreadOwnerId,
}