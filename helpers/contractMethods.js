const { inlineCode, EmbedBuilder, Colors } = require('discord.js');
const { getFeedbackChannels, getFeedbackForumTagIds } = require('./settingsMethods');
const { showCommandError } = require('./messageMethods.js');
const { concatList } = require('./util.js');

const constants = require("../helpers/constants.js");

/**
 * Returns `true` if the thread has the "open for feedback" tag.
 * @param {ThreadChannel} thread The thread.
 * @returns {boolean} True if the thread is open for feedback.
 */
async function isFeedbackEnabled(thread) {
    const feedbackForumTags = thread.appliedTags;
    const feedbackTagIds = await getFeedbackForumTagIds();
    return feedbackTagIds.some(tagId => feedbackForumTags.includes(tagId));
}

/**
 * Gets whether the channel is a thread within a feedback channel.
 * @param {BaseGuildTextChannel} channel The channel to check.
 * @returns {bool} Whether the channel is a valid feedback thread.
 */
async function isChannelFeedbackThread(channel) {
    // Get that any of the assigned feedback channel IDs are the parent of this channel.
    const feedbackChannels = await getFeedbackChannels(channel.guild);
    return feedbackChannels.some(feedbackChannel => channel.parentId == feedbackChannel.id);
}

/**
 * Gets whether an interaction occurred within a feedback thread. Returns the
 * feedback thread, or `null` if the interaction happened outside of a
 * designated feedback thread.
 * @param {import('discord.js').Interaction} interaction The interaction.
 * @returns {ThreadChannel?} The feedback thread if it exists, or null if invalid.
 */
async function getFeedbackThreadFromInteraction(interaction) {
    return await isChannelFeedbackThread(interaction.channel) ? interaction.channel : null;
}

/**
 * Gets the owner ID of a feedback thread or `null` if not a feedback thread.
 * @param {ThreadChannel} thread The thread.
 * @returns {string?} The user ID of the thread owner.
 */
async function getFeedbackThreadOwnerId(thread) {
    return await isChannelFeedbackThread(thread) ? thread.ownerId : null;
}

/**
 * Responds to an interaction with an error regarding the correct feedback channel.
 * @param {CommandInteraction} the command that generated this interaction
 */
async function showIncorrectChannelError(interaction) {
    const feedbackChannels = await getFeedbackChannels(interaction.guild);
    showCommandError(interaction, `You can only use ${inlineCode(`/contract ${interaction.options.getSubcommand()}`)} within ${concatList(feedbackChannels)}.`);
}

/**
 * Gets the owner of a feedback thread in the guild or `null` if not a feedback thread.
 * @param {ThreadChannel} thread The thread.
 * @returns {User?} The thread owner's user.
 */
async function getFeedbackThreadOwner(thread) {
    const ownerId = await getFeedbackThreadOwnerId(thread);
    return (await thread.guild.members.fetch(ownerId)).user;
}

/**
 * Parses a label rating string (bomb or star emojis) into a value based on star rating definitions.
 * @param {string} label The label rating string to parse.
 * @returns {int} The points to award from this rating.
 */
function parseRatingLabelToPoints(label) {
    const matchedRatings = Object.values(constants.STAR_RATING_INFO).filter(rating => rating.menu_label == label);
    if (matchedRatings.length > 0) {
        // Rating has this label
        return matchedRatings[0].point_value;
    }
    // No rating found, no points
    return 0;
}

module.exports = {
    isFeedbackEnabled,
    isChannelFeedbackThread,
    getFeedbackThreadFromInteraction,
    getFeedbackThreadOwnerId,
    showIncorrectChannelError,
    getFeedbackThreadOwner,
    parseRatingLabelToPoints
}