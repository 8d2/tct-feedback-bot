// Stores settings set by admin commands, including getter + setter methods.

const { Collection } = require('discord.js');
const { SETTINGS_MAIN_IDENTIFIER, Roles, Settings } = require('../dbObjects.js');

let settings;

/**
 * Get channel id where feedback contracts can be made.
 * @returns {string?} Feedback channel ID. Can be null if not set.
 */
function getFeedbackChannelId() {
    return settings ? settings.feedback_channel_id : null;
}

/**
 * Get roles for settings.
 * @returns {[Roles]} Roles. Empty if no roles set.
 */
async function getRoles() {
    return settings ? await settings.getRoles() : [];
}

module.exports = {
    getFeedbackChannelId,
    getRoles,

    /**
     * Initialize main settings database.
     */
    async init() {
        settings = await Settings.findOne({
            where: { identifier: SETTINGS_MAIN_IDENTIFIER }
        });
    }
}