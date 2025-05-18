// Stores information about feedback threads and collaborators.

const { Collection } = require("discord.js");
const { Threads, Collaborators } = require('../dbObjects.js');
const { getFeedbackThreadOwner } = require("./contractMethods.js");

const userMethods = require("./userMethods.js");

const threads = new Collection();
const collaborators = new Collection();

/**
 * Generates and returns a formatted key for a collaboration instance.
 * @param {string} userId the user id to use in the key
 * @param {string} threadId the thread id to use in the key
 * @return {string} the collaborator key
 */
function getCollaboratorKey(userId, threadId) {
    return `${userId}_${threadId}`
}

/**
 * Gets the user ID and thread ID associated with the collaborator key.
 * @param {string} collaboratorKey The collaborator key
 * @return {[string, string]?} Tuple [userId, threadId] that this collaborator key matches, or null if not matching.
 */
function getUserIdAndThreadIdFromKey(collaboratorKey) {
    const items = collaboratorKey.split("_");
    if (items.length == 2) {
        // User ID and thread ID
        return [items[0], items[1]];
    }
    return null;
}

/**
 * Returns a thread info for a given thread.
 * If there isn't one in the database, it is created along with a collaboration instance for the thread owner.
 * @param {ThreadChannel} thread the thread to get the thread info of
 * @return {Threads} the thread
 */
async function getOrCreateThreadInfo(thread) {
    // create thread info
    const existingThread = threads.get(thread.id);
    if (existingThread) {
        return existingThread;
    }
    const newThread = await Threads.create({thread_id: thread.id});
    threads.set(thread.id, newThread);
    
    // create collaboration instance for the thread owner
    const collabKey = getCollaboratorKey(thread.ownerId, thread.id);
    const ownerCollab = await Collaborators.create({collaboration_id: collabKey});
    collaborators.set(collabKey, ownerCollab);
    
    return newThread;
}

/**
 * Gets the number of collaborators participating in a specific thread.
 * @param {ThreadChannel} thread The thread
 * @return {int} The number of collaborators
 */
async function getThreadCollaboratorCount(thread) {
    const threadInfo = await getOrCreateThreadInfo(thread);
    return threadInfo.collaborator_count;
}

/**
 * Returns users that have collaborator in a specific thread.
 * @param {ThreadChannel} thread The thread
 * @param {boolean} discardOwner If true, will remove the thread owner from the returned results
 * @return {[User]} List of users
 */
async function getThreadCollaboratorUsers(thread, discardOwner) {
    // Replaced to more reflect the original because `usersWithInfo` does not account for users without data in database
    await getOrCreateThreadInfo(thread); // ensure the owner collab instance exists
    const collabData = await Collaborators.findAll();
    const threadOwner = await getFeedbackThreadOwner(thread);
    let listOfUsers = [];
    for (let dataInstance of collabData) {
        // For every collaborator key, see if the thread is this one
        const [userId, threadId] = getUserIdAndThreadIdFromKey(dataInstance.collaboration_id);
        if (threadId == thread.id && userId) {
            const user = (await thread.guild.members.fetch(userId)).user;

            // No need to show that the thread owner is a builder again
            if (!discardOwner || user != threadOwner) {
                listOfUsers.push(user)
            }
        }
    }
    return listOfUsers;
}

/**
 * Checks whether a user is a collaborator in a thread. Also returns true
 * if the user owns the thread.
 * @param {User} user The user to check
 * @param {ThreadChannel} thread The thread to check in
 * @return {boolean} Whether the user is a collaborator in the thread
 */
async function getUserIsCollaborator(user, thread) {
    await getOrCreateThreadInfo(thread); // ensure the owner collab instance exists
    const collabKey = getCollaboratorKey(user.id, thread.id);
    const collabInstance = collaborators.get(collabKey);
    
    return collabInstance ? true : false
}

/**
 * Attempts to add a user as a collaborator to a thread.
 * @param {User} user The user to add
 * @param {ThreadChannel} thread The thread to add as collaborator to
 * @return {boolean} `true` if this succeeded, `false` if the user is already a collaborator.
 */
async function addCollaboratorToThread(user, thread) {
    const threadInfo = await getOrCreateThreadInfo(thread); // ensure the owner collab instance exists
    const collabKey = getCollaboratorKey(user.id, thread.id);
    const collabInstance = collaborators.get(collabKey);
    
    if (collabInstance) {
        return false;
    }
    else {
        const newCollab = await Collaborators.create({collaboration_id: collabKey});
        collaborators.set(collabKey, newCollab);
        threadInfo.collaborator_count += 1;
        threadInfo.save();
        return true;
    }
}

/**
 * Attempts to remove a user as collaborator from a thread.
 * @param {User} user The user to remove
 * @param {ThreadChannel} thread The thread to remove as collaborator from
 * @return {boolean} `true` if this succeeded, `false` if the user cannot be removed.
 */
async function removeCollaboratorFromThread(user, thread) {
    const threadInfo = await getOrCreateThreadInfo(thread);
    const collabKey = getCollaboratorKey(user.id, thread.id);
    const collabInstance = collaborators.get(collabKey);
    
    if (thread.ownerId != user.id && collabInstance) {
        const result = await Collaborators.destroy({where: {collaboration_id: collabKey}})
        collaborators.delete(collabKey);
        threadInfo.collaborator_count -= 1;
        threadInfo.save();
        return true;
    }
    else {
        return false;
    }
}

module.exports = {
    getUserIsCollaborator,
    getThreadCollaboratorCount,
    getThreadCollaboratorUsers,
    addCollaboratorToThread,
    removeCollaboratorFromThread,

    /**
     * Initialize threads and collaborators collections from database.
     */
    async init() {
        const storedThreads = await Threads.findAll()
        storedThreads.forEach(thread => threads.set(thread.thread_id, thread));
        const storedCollaborators = await Collaborators.findAll()
        storedCollaborators.forEach(collaborator => collaborators.set(collaborator.collaboration_id, collaborator));
    },
}