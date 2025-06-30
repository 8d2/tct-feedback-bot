// Helper methods for channels.

const { Client } = require("discord.js");

let storedClient = null;

/**
 * Gets a channel by ID.
 * @param {string} channelId 
 * @returns {import("discord.js").Channel?}
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
     * @param {Client} client 
     */
    async init(client) {
        storedClient = client;
    },
}