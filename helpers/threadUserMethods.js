const { Collection } = require("discord.js");
const { ThreadUsers } = require("../dbObjects.js");
const constants = require("../helpers/constants.js");
const crypto = require("node:crypto");
const settingsMethods = require("./settingsMethods.js");

const threadUsers = new Collection();

/**
 * Returns a hash corresponding to a unique threadid-userid pair.
 * @param {string} threadId 
 * @param {string} userId 
 * @returns A unique hash.
 */
function hashThreadUser(threadId, userId) {
    const hash = crypto
        .createHash(constants.THREADUSER_HASHING_ALGORITHM, { outputLength: constants.THREADUSER_ENCODING_BYTES, encoding: 'hex' })
        .update(threadId + 'a' + userId) // create a unique hexadecimal string by "concatenating" threadId and userId, separated by 'a'
        .digest('base64');
    return hash;
}

/**
 * Get a ThreadUser from thread id and user id.
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 * @returns {ThreadUsers?} ThreadUser. Null if doesn't exist.
 */
function getThreadUserInfo(threadId, userId) {
    const hash = hashThreadUser(threadId, userId);
    const threadUser = threadUsers.get(hash);
    return threadUser;
}

/**
 * Get a ThreadUser from thread id and user id, and if not found, create a new threaduser to store.
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 * @returns {ThreadUsers?} ThreadUser. Null if doesn't exist.
 */
async function getOrCreateThreadUserInfo(threadId, userId) {
    const hash = hashThreadUser(threadId, userId);
    const threadUser = threadUsers.get(hash);
    if (threadUser) {
        return threadUser;
    }
    const newThreadUser = await ThreadUsers.create({thread_id: threadId, user_id: userId});
    threadUsers.set(hash, newThreadUser);
    return newThreadUser;
}

/**
 * Gets the message ID of the ThreadUser's active contract, if it exists.
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 * @returns {string?} The message ID of the active contract, if it exists.
 */
async function getActiveContractMessageId(threadId, userId) {
    const threadUser = await getOrCreateThreadUserInfo(threadId, userId);
    return threadUser ? threadUser.active_contract_message_id : null;
}

/**
 * Gets when a ThreadUser last posted a contract.
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 * @returns {Date?} The date when the user last posted a contract in the thread.
 */
async function getLastContractPosted(threadId, userId) {
    const threadUser = await getOrCreateThreadUserInfo(threadId, userId);
    return threadUser ? threadUser.last_contract_posted : null;
}

/**
 * Gets the remaining **seconds** until the user (`userId`) can post another contract in the thread (`threadId`).
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 * @returns {number} The time in **seconds** until the ThreadUser's cooldown wears off, or `0`
 * if they have no active contract cooldown.
 */
async function getThreadUserCooldown(threadId, userId) {
    const lastContractPostedDate = await getLastContractPosted(threadId, userId);
    // If lastContractPostedDate is null, then the user has never posted a contract in the thread
    // and thus has no active cooldown.
    if (lastContractPostedDate == null) return 0;

    const contractCooldownSeconds = await settingsMethods.getContractCooldown(); // measured in SECONDS
    const timeSinceLastContract = Date.now() - lastContractPostedDate.getTime(); // measured in MILLISECONDS
    const res = Math.max(0, contractCooldownSeconds - 0.001 * timeSinceLastContract);
    return Math.ceil(res);
}

/**
 * Resets a user's (`userId`) active contract message ID within the thread (`threadId`).
 * Intended for use after the user's contract has been fulfilled.
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 * @param {string?} messageId The message ID of the ThreadUser's active contract.
 * Can be null.
 * @returns {ThreadUsers} ThreadUser.
 */
async function resetActiveContractMessageId(threadId, userId) {
    const threadUser = await getOrCreateThreadUserInfo(threadId, userId);
    return await setActiveContractMessageIdFromThreadUser(threadUser, null);
}

/**
 * Sets a ThreadUser's active contract message ID.
 * @param {ThreadUsers} threadUser ThreadUser to set active contract message ID.
 * @param {string?} messageId The message ID of the ThreadUser's active contract.
 * Can be null.
 */
async function setActiveContractMessageIdFromThreadUser(threadUser, messageId) {
    threadUser.active_contract_message_id = messageId;
    return threadUser.save();
}

/**
 * Sets the message ID of a user's (`userId`) active contract message
 * within the thread (`threadId`).
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 * @param {string?} messageId The message ID of the ThreadUser's active contract.
 * Can be null.
 * @returns {ThreadUsers} ThreadUser.
 */
async function setActiveContractMessageId(threadId, userId, messageId) {
    const threadUser = await getOrCreateThreadUserInfo(threadId, userId);
    return await setActiveContractMessageIdFromThreadUser(threadUser, messageId);
}

/**
 * Sets the date when a ThreadUser last posted a contract.
 * @param {ThreadUsers} threadUser ThreadUser to set last contract posted date.
 * @param {Date} date When the ThreadUser last posted a contract. Defaults to now.
 * @returns {ThreadUsers} ThreadUser.
 */
async function setLastContractPostedFromThreadUser(threadUser, date = new Date()) {
    threadUser.last_contract_posted = date;
    return threadUser.save();
}

/**
 * Sets the date when a user (`userId`) last posted a contract in the thread (`threadId`).
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 * @param {Date} date When the ThreadUser last posted a contract. Defaults to now.
 * @returns {ThreadUsers} ThreadUser.
 */
async function setLastContractPosted(threadId, userId, date = new Date()) {
    const threadUser = await getOrCreateThreadUserInfo(threadId, userId);
    return await setLastContractPostedFromThreadUser(threadUser, date);
}

module.exports = {
    getThreadUserInfo,
    getOrCreateThreadUserInfo,
    getActiveContractMessageId,
    getLastContractPosted,
    getThreadUserCooldown,
    resetActiveContractMessageId,
    setActiveContractMessageIdFromThreadUser,
    setActiveContractMessageId,
    setLastContractPostedFromThreadUser,
    setLastContractPosted,

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