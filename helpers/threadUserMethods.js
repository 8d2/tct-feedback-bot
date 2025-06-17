const { Collection } = require("discord.js");
const { ThreadUsers } = require("../dbHandler");
const constants = require("../helpers/constants.js");

const threadUsers = new Collection();

async function getOrCreateThreadUserInfo(threadId, userId) {
    const threadUser = await ThreadUsers.findOne({
        where: { thread_id: threadId, user_id: userId }
    });
    if (threadUser) {
        return threadUser;
    }
    const newThreadUser = await ThreadUsers.create();
    threadUsers.set(id, newUser);
    return newUser;
}

module.exports = {
    getOrCreateThreadUserInfo,

    /**
     * Initialize thread_users collection from database.
     */
    async init() {
        const storedThreadUsers = await ThreadUsers.findAll()
        storedThreadUsers.forEach(threadUser => threadUsers.set(threadUser.id, threadUser));
    },
}