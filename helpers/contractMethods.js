const { Interaction } = require('discord.js');
const { getFeedbackChannelId } = require('./settingsMethods');

/**
 * Gets whether an interaction occurred within a feedback thread. Returns the
 * feedback thread ID, or `null` if the interaction happened outside of a
 * designated feedback thread.
 * @param {Interaction} interaction 
 * @returns {string?} The feedback thread ID if it exists, or null if invalid.
 */
async function getFeedbackThreadFromInteraction(interaction) {
    if (interaction.channel.parentId != getFeedbackChannelId()) return null;
    return interaction.channel.id;
}