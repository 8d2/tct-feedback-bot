// Helper methods for channels.

const { Client } = require("discord.js");

let storedClient = null;

/**
 * Gets a channel by ID. (An actual Discord channel object,
 * not a channel from the bot's database.)
 * @param {string} channelId The channel ID.
 * @returns {import("discord.js").Channel?} A Discord channel corresponding to the ID.
 */
async function getChannelById(channelId) {
    if (!storedClient) {
        console.warn(`${getChannelById.name} failed; client has not been loaded yet`);
        return;
    }
    return await client.channels.fetch(channelId);
}

module.exports = {
    getChannelById,

    /**
     * Initialize channel helper functions.
     * @param {Client} client The bot's client.
     */
    async init(client) {
        storedClient = client;
    },
};