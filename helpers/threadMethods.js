// Stores threads by thread id. Includes some helpful thread data modification methods.

const { Collection } = require('discord.js');
const { Threads, Collaborators } = require('../dbObjects.js');

const threads = new Collection();

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

module.exports = {
    getOrCreateThreadInfo,
    getThreadCollaboratorCount,

    /**
     * Initialize threads and collaborators collections from database.
     */
    async init() {
        const storedThreads = await Threads.findAll()
        storedThreads.forEach(thread => threads.set(thread.thread_id, thread));
    },
}