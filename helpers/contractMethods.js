const { ThreadChannel, MessageFlags, inlineCode, EmbedBuilder, Colors } = require('discord.js');
const { getFeedbackChannel, getFeedbackChannelId, getFeedbackForumTagId } = require('./settingsMethods');

/**
 * Returns `true` if the thread has the "open for feedback" tag.
 * @param {ThreadChannel} thread The thread.
 * @returns {boolean} True if the thread is open for feedback.
 */
async function isFeedbackEnabled(thread) {
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

/**
 * Responds to an interaction with an error regarding the correct feedback channel.
 * @param {CommandInteraction} the command that generated this interaction
 */
async function showIncorrectChannelError(interaction) {
    const realFeedbackChannel = await getFeedbackChannel(interaction.guild);
    showCommandError(interaction, `You can only use ${inlineCode(`/contract ${interaction.options.getSubcommand()}`)} within ${realFeedbackChannel}.`);
}

module.exports = {
    isFeedbackEnabled,
    getFeedbackThreadFromInteraction,
    getFeedbackThreadOwnerId,
    showCommandError,
    showIncorrectChannelError,
}