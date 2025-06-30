const { Collection, ThreadChannel } = require("discord.js");
const { ThreadUsers, Users } = require("../dbObjects.js");
const constants = require("../helpers/constants.js");
const contractMethods = require("../helpers/contractMethods.js");
const crypto = require("node:crypto");
const settingsMethods = require("./settingsMethods.js");
const userMethods = require("./userMethods.js");

const threadUsers = new Collection();

// REALLY REALLY IMPORTANT METHODS

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

// ALSO IMPORTANT METHODS THAT RELY ON THE ABOVE

/**
 * Adds a user (`userId`) as a collaborator to the thread (`threadId`).
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 */
async function addCollaborator(threadId, userId) {
    const threadUser = await getOrCreateThreadUserInfo(threadId, userId);
    threadUser.is_collaborator = true;
    return threadUser.save();
}

/**
 * Fetches all collaborators in a thread.
 * @param {ThreadChannel} threadId The thread to fetch all collaborators from
 * @param {boolean} [discardOwner=false] Whether to exclude the feedback thread
 * owner from the returned Collection
 * @returns {Collection<Users>} A Collection containing the fetched collaborators.
 */
async function getAllCollaboratorsFromThread(thread, discardOwner = false) {

    // Get all collaborators in thread
    const collaborators = getAllThreadUsersFromThread(thread.id)
        .filter(threadUser => threadUser.is_collaborator == true)
        .map(threadUser => getUserFromThreadUser(threadUser));
    
    // Discard thread owner from results if discardOwner == true
    if (discardOwner) {
        const threadOwnerId = await contractMethods.getFeedbackThreadOwnerId(thread);
        return collaborators.filter(user => user.user_id == threadOwnerId);
    }

    return collaborators;
}

/**
 * Fetches all ThreadUsers that match a thread ID.
 * @param {string} threadId The ID of the thread to fetch all ThreadUsers from
 * @returns {Collection<ThreadUsers>}
 */
function getAllThreadUsersFromThread(threadId) {
    return threadUsers.filter(threadUser => threadUser.thread_id == threadId);
}

/**
 * Fetches all ThreadUsers that match a user ID.
 * @param {string} userId The ID of the thread to fetch all ThreadUsers from
 * @returns {Collection<ThreadUsers>}
 */
function getAllThreadUsersFromUser(userId) {
    return threadUsers.filter(threadUser => threadUser.user_id == userId);
}

/**
 * Gets whether a user (`userId`) is a collaborator in the thread (`threadId`).
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 * @returns {boolean} `true` if the user is a collaborator or thread owner,
 * `false` otherwise.
 */
async function getIsCollaborator(threadId, userId) {
    const threadUser = await getOrCreateThreadUserInfo(threadId, userId);
    return threadUser ? threadUser.is_collaborator : false;
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
 * Gets the unique `Users` object belonging to a ThreadUser.
 * @param {ThreadUsers} threadUser The ThreadUser.
 * @returns {Users} The User belonging to the ThreadUser object.
 */
function getUserFromThreadUser(threadUser) {
    return userMethods.getUserInfo(threadUser.user_id);
}

/**
 * Removes a user (`userId`) as a collaborator to the thread (`threadId`).
 * @param {string} threadId Thread ID of the corresponding ThreadUser.
 * @param {string} userId User ID of the corresponding ThreadUser.
 */
async function removeCollaborator(threadId, userId) {
    const threadUser = await getOrCreateThreadUserInfo(threadId, userId);
    threadUser.is_collaborator = false;
    return threadUser.save();
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
    return setLastContractPostedFromThreadUser(threadUser, date);
}

module.exports = {
    getThreadUserInfo,
    getOrCreateThreadUserInfo,

    addCollaborator,
    getAllCollaboratorsFromThread,
    getAllThreadUsersFromThread,
    getAllThreadUsersFromUser,
    getIsCollaborator,
    getLastContractPosted,
    getThreadUserCooldown,
    getUserFromThreadUser,
    removeCollaborator,
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