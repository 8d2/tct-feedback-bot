// Stores users by user id, including some helpful user data modification methods.

const { Collection } = require('discord.js');
const { Users } = require('../dbObjects.js');

const users = new Collection();

/**
 * Get a User from user id.
 * @param {string} id ID to get.
 * @returns {Users?} User. Null if doesn't exist.
 */
function getUserInfo(id) {
    return users.get(id);
}

/**
 * Get a User from user id, and if not found, create a new user to store.
 * @param {string} id ID to get or create.
 * @returns {Users} User.
 */
async function getOrCreateUserInfo(id) {
    const user = users.get(id);
    if (user) {
        return user;
    }
    const newUser = await Users.create({user_id: id});
    users.set(id, newUser);
    return newUser;
}

/**
 * Get how many feedback points a user has from their user id.
 * @param {string} id ID to get.
 * @returns {int} User's points.
 */
function getPoints(id) {
    const user = getUserInfo(id);
    return user ? user.feedback_points : 0;
}

/**
 * Get whether the user ID is blocked from creating contracts.
 * @param {string} the user id to get the block status of
 * @return {boolean} whether the user is blocked
 */
function getIsBlocked(id) {
    const user = getUserInfo(id);
    return user ? user.is_blocked : false;
}

/**
 * Set how many feedback points a user has.
 * @param {Users} user User to set points of.
 * @param {int} points Points to set.
 * @returns {Users} User.
 */
async function setPointsFromUser(user, points) {
    user.feedback_points = points;
    return user.save();
}

/**
 * Sets a user's blocked state for creating contracts.
 * @param {Users} user User to set the blocked state of.
 * @param {boolean} the new blocked state to set.
 * @returns {Users} the user.
 */
async function setIsBlockedFromUser(user, isBlocked) {
    user.is_blocked = isBlocked;
    return user.save();
}

/**
 * Set how many feedback points a user has based on their user id.
 * @param {string} id ID to set points of.
 * @param {int} points Points to set.
 * @returns {Users} User.
 */
async function setPoints(id, points) {
    const user = await getOrCreateUserInfo(id);
    return setPointsFromUser(user, points);
}

/**
 * Add to a user's feedback points based on their user id.
 * @param {string} id ID to set points of.
 * @param {amount} amount Points to add.
 * @returns {Users} User.
 */
async function addPoints(id, amount) {
    const user = await getOrCreateUserInfo(id);
    return setPointsFromUser(user, user.feedback_points + amount);
}

/**
 * Sets a user's blocked state for creating contracts, based on their user ID.
 * @param {string} the user ID to set the blocked state of
 * @param {boolean} the new blocked state (true -> blocked, false -> unblocked)
 * @returns {Users} the user
 */
async function setIsBlocked(id, isBlocked) {
    const user = await getOrCreateUserInfo(id);
    return setIsBlockedFromUser(user, isBlocked);
}

module.exports = {
    getUserInfo,
    getPoints,
    getIsBlocked,
    setPoints,
    setIsBlocked,

    /**
     * Initialize users collection from database.
     */
    async init() {
        const storedUsers = await Users.findAll()
        storedUsers.forEach(user => users.set(user.user_id, user));
    },
}