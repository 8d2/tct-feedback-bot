// Stores users by user id, including some helpful user data modification methods.
const { Collection } = require('discord.js');
const { Users } = require('../dbObjects.js');

const users = new Collection()

// Get a User from user id.
function getUserInfo(id) {
    return users.get(id);
}

// Get a User from user id, and if not found, create a new user to store.
async function getOrCreateUserInfo(id) {
    const user = users.get(id);
    if (user) {
        return user;
    }
    const newUser = await Users.create({user_id: id});
    users.set(id, newUser);
    return newUser;
}

// Get how many feedback points a user has from their user id.
function getPoints(id) {
    const user = getUserInfo(id);
    return user ? user.feedback_points : 0;
}

// Set how many feedback points a user has.
async function setPointsFromUser(user, points) {
    user.feedback_points = points;
    return user.save();
}

// Set how many feedback points a user has based on their user id.
async function setPoints(id, points) {
    const user = await getOrCreateUserInfo(id);
    return setPointsFromUser(user, points);
}

// Add to a user's feedback points based on their user id.
async function addPoints(id, amount) {
    const user = await getOrCreateUserInfo(id);
    return setPointsFromUser(user, user.feedback_points + amount);
}

module.exports = {
    getUserInfo,
    getPoints,
    setPoints,

    // Gets users from the database and inserts them into stored users.
    async update(params) {
        const storedUsers = await Users.findAll()
        storedUsers.forEach(user => users.set(user.user_id, user));
    },
}