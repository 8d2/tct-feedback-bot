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
async function getPoints(id) {
    const user = await getOrCreateUserInfo(id);
    return user ? user.feedback_points : 0;
}

/**
 * Get whether the user ID is blocked from creating contracts.
 * @param {string} the user id to get the block status of
 * @return {boolean} whether the user is blocked
 */
async function getIsBlocked(id) {
    const user = await getOrCreateUserInfo(id);
    return user ? user.is_blocked : false;
}

/**
 * Get whether the user ID will receive pings on creation of a contract in their thread.
 * @param {string} the user id to get the allowping status of
 * @return {boolean} whether the user allows pings
 */
async function getAllowPings(id) {
    const user = await getOrCreateUserInfo(id);
    return user ? user.allow_pings : false;
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
 * Set value of allowpings setting.
 * @param {Users} user User to set for.
 * @param {int} allow Value to set.
 * @returns {Users} User.
 */
async function setAllowPingsFromUser(user, allow) {
    user.allow_pings = allow;
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

/**
 * Set value of allowpings setting, based on their user ID.
 * @param {string} the user ID to set the allowpings setting of
 * @param {boolean} the new value (true -> allow, false -> unallow)
 * @returns {Users} the user
 */
async function setAllowPings(id, allow) {
    const user = await getOrCreateUserInfo(id);
    return setAllowPingsFromUser(user, allow);
}

/**
 * Handles the user reading and accepting the rules, as well as checks for if they have done so.
 * @param {string} id The user id to set.
 */
async function setRulesAccepted(id) {
    // Since this is a 1 use function, there is no need for a fromUser version
    const user = await getOrCreateUserInfo(id);
    user.accepted_rules = true;
    user.save()
}

/**
 * Get whether a user has accepted contract rules.
 * @param {string} id The user id to get.
 */
async function getRulesAccepted(id) {
    const user = await getOrCreateUserInfo(id);
    return user ? user.accepted_rules : false;
}

module.exports = {
    getUserInfo,
    getPoints,
    getIsBlocked,
    getAllowPings,
    getRulesAccepted,
    setPoints,
    setIsBlocked,
    setAllowPings,
    setRulesAccepted,

    /**
     * Initialize users collection from database.
     */
    async init() {
        const storedUsers = await Users.findAll()
        storedUsers.forEach(user => users.set(user.user_id, user));
    },
}