const { Collection } = require("discord.js");
const { ThreadUsers } = require("../dbHandler");
const constants = require("../helpers/constants.js");
const crypto = require("node:crypto");

const threadUsers = new Collection();

function hashThreadUser(threadId, userId) {
    const hash = crypto
        .createHash(constants.THREADUSER_HASHING_ALGORITHM, { outputLength: constants.THREADUSER_ENCODING_BYTES, encoding: 'hex' })
        .update(threadId + 'a' + userId)
        .digest('base64');
    return hash;
}

async function getOrCreateThreadUserInfo(threadId, userId) {
    const hash = hashThreadUser(threadId, userId);
    const threadUser = threadUsers.get(hash);
    if (threadUser) {
        return threadUser;
    }
    const newThreadUser = await ThreadUsers.create();
    threadUsers.set(hash, newThreadUser);
    return newUser;
}

module.exports = {
    getOrCreateThreadUserInfo,

    /**
     * Initialize thread_users collection from database.
     */
    async init() {
        const storedThreadUsers = await ThreadUsers.findAll()
        storedThreadUsers.forEach(
            threadUser => threadUsers.set(
                // ThreadUser IDs are constructed by combining thread_id and user_id
                hashThreadUser(threadUser.thread_id, threadUser.user_id), 
                threadUser
            )
        );
    },
}