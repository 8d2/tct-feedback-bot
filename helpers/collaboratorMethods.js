// Stores information about feedback threads and collaborators.

const { Collection } = require("discord.js");
const { Threads, Collaborators } = require('../dbObjects.js');
const { getFeedbackThreadOwner } = require("./contractMethods.js");

const threadMethods = require("./threadMethods.js");

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
 * Returns users that have collaborator in a specific thread.
 * @param {ThreadChannel} thread The thread
 * @param {boolean} discardOwner If true, will remove the thread owner from the returned results
 * @return {[User]} List of users
 */
async function getThreadCollaboratorUsers(thread, discardOwner) {
    // Replaced to more reflect the original because `usersWithInfo` does not account for users without data in database
    await threadMethods.getOrCreateThreadInfo(thread); // ensure the owner collab instance exists
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
 * Attempts to add a user as a collaborator to a thread.
 * @param {User} user The user to add
 * @param {ThreadChannel} thread The thread to add as collaborator to
 * @return {boolean} `true` if this succeeded, `false` if the user is already a collaborator.
 */
async function addCollaboratorToThread(user, thread) {
    const threadInfo = await threadMethods.getOrCreateThreadInfo(thread); // ensure the owner collab instance exists
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
    const threadInfo = await threadMethods.getOrCreateThreadInfo(thread);
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