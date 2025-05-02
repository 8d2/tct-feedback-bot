const { Collection } = require('discord.js');
const { Users } = require('./dbObjects.js');

const users = new Collection()

function getUserInfo(id) {
    return users.get(id);
}

async function getOrCreateUserInfo(id) {
    const user = users.get(id);
    if (user) {
        return user;
    }
    const newUser = await Users.create({user_id: id});
    users.set(id, newUser);
    return newUser;
}

function getPoints(id) {
    const user = getUserInfo(id);
    return user ? user.feedback_points : 0;
}

async function setPoints(id, points) {
    const user = await getOrCreateUserInfo(id);
    user.feedback_points = points;
    return user.save();
}

module.exports = {
    getUserInfo,
    getPoints,
    setPoints,
    async sync(params) {
        const storedUsers = await Users.findAll()
        storedUsers.forEach(user => users.set(user.user_id, user));
    },
}