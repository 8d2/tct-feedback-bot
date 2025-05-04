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

module.exports = {
    getUserInfo,
    getPoints,
    setPoints,

    /**
     * Initialize users collection from database.
     */
    async init() {
        const storedUsers = await Users.findAll()
        storedUsers.forEach(user => users.set(user.user_id, user));
    },
}