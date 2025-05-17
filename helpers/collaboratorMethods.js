// Stores information about feedback threads and collaborators.

const { PermissionFlagsBits, Collection } = require("discord.js");
const { Threads, Collaborators } = require('../dbObjects.js');
const { getFeedbackThreadOwnerId } = require("./contractMethods.js");

const threads = new Collection();
const collaborators = new Collection();

/**
 * Generates and returns a formatted key for a collaboration instance.
 * @param {string} the user id to use in the key
 * @param {string} the thread id to use in the key
 * @return {string} the collaborator key
 */
function getCollaboratorKey(userId, threadId) {
    return `${userId}_${threadId}`
}

/**
 * Returns a thread info for a given thread.
 * If there isn't one in the database, it is created along with a collaboration instance for the thread owner.
 * @param {ThreadChannel} the thread to get the thread info of
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
 * @param {ThreadChannel} the thread
 * @return {int} the number of collaborators
 */
async function getThreadCollaboratorCount(thread) {
    const threadInfo = await getOrCreateThreadInfo(thread);
    return threadInfo.collaborator_count;
}

/**
 * Checks whether a user is a collaborator in a thread. Also returns true
 * if the user owns the thread.
 * @param {User} the user to check
 * @param {ThreadChannel} the thread to check in
 * @return {boolean} whether the user is a collaborator in the thread
 */
async function getUserIsCollaborator(user, thread) {
    await getOrCreateThreadInfo(thread); // ensure the owner collab instance exists
    const collabKey = getCollaboratorKey(user.id, thread.id);
    const collabInstance = collaborators.get(collabKey);
    
    return collabInstance ? true : false
}

/**
 * Attempts to add a user as a collaborator to a thread.
 * @param {User} the user to add
 * @param {ThreadChannel} the thread to add as collaborator to
 * @return {boolean} true if this succeeded, false if the user is already a collaborator.
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
 * @param {User} the user to remove
 * @param {ThreadChannel} the thread to remove as collaborator from
 * @return {boolean} true if this succeeded, false if the user cannot be removed.
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