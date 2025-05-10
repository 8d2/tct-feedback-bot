// Stores users by user id, including some helpful user data modification methods.
// IMPORTANT: There is a different between a discord.js *User* and the *Users* database.
// A database *Users* would need to be converted, such as how getUsersWithInfo does it.

const { Colors, EmbedBuilder } = require("discord.js");

const { getRoles } = require('./settingsMethods.js');
const { handleAddRole, handleRemoveRole } = require('../handlers/unsafe.js');
const { Collection } = require('discord.js');
const { Users } = require('../dbObjects.js');
const constants = require("../helpers/constants.js")

const users = new Collection();

/**
 * Returns a list of users that have data in the system.
 * @param {Guild} guild The guild to get users from.
 * @returns {[User]} Users that have data.
 */
async function getUsersWithInfo(guild) {
    const allUsers = await Users.findAll();
        
    // Converts users into discord.js users
    // I moved this into here for easy use elsewhere if needed
    var listOfUsers = []
    for (let user of allUsers) {
        listOfUsers.push((await guild.members.fetch(user.user_id)).user)
    }
    return listOfUsers;
}

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
 * Get how many feedback points a user has.
 * @param {Users} user User to get.
 * @returns {int} User's points.
 */
async function getPointsFromUser(user) {
    return user ? user.feedback_points : 0;
}

/**
 * Get how many feedback points a user has from their user id.
 * @param {string} id ID to get.
 * @returns {int} User's points.
 */
async function getPoints(id) {
    const user = await getOrCreateUserInfo(id);
    return getPointsFromUser(user);
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
 * Sets a user's accepted_rules to true so they can create contracts.
 * @param {string} the user ID to accept the rules for
 */
async function setRulesAccepted(id) {
    // Since this is a 1 use function, there is no need for a fromUser version
    const user = await getOrCreateUserInfo(id);
    user.accepted_rules = true;
    user.save()
}

/**
 * Checks if a user has accepted the rules
 * @param {string} the user ID to check the rules for
 * @returns {boolean} Returns true if rules accepted and false if not
 */
async function getRulesAccepted(id) {
    const user = await getOrCreateUserInfo(id);
    return user ? user.accepted_rules : false;
}

/**
 * Updates a user's roles depending on how many feedback points they have.
 * @param {CommandInteraction} interaction The interaction to update roles from.
 * @param {Users} user The user to update.
 * @return {[EmbedBuilder]} Any error embeds from updating roles. If empty, no errors occurred.
 */
async function updateRolesFromUser(interaction, user) {
    const guildMember = await interaction.guild.members.fetch(user.user_id);
    const feedbackPoints = await getPointsFromUser(user);
    const roles = await getRoles();
    let errorEmbeds = [];
    for(const role of roles) {
        const hasRole = feedbackPoints >= role.role_requirement;
        const guildRole = await interaction.guild.roles.fetch(role.role_id);
        let errorMessage;
        if (hasRole) {
            // User has enough points for this role
            errorMessage = await handleAddRole(guildMember, guildRole);
        }
        else {
            // Not enough, remove if they had role before
            errorMessage = await handleRemoveRole(guildMember, guildRole);
        }
        if (errorMessage) {
            // Some error with adding/removing roles
            const errorEmbed = new EmbedBuilder().setTimestamp().setDescription(errorMessage).setColor(Colors.Red);
            errorEmbeds.push(errorEmbed);
        }
    }
    return errorEmbeds;
}

/**
 * Updates a user's roles depending on how many feedback points they have, based on their user id.
 * @param {CommandInteraction} interaction The interaction to update roles from.
 * @param {string} id The user id of the user to update.
 * @return {[EmbedBuilder]} Any error embeds from updating roles. If empty, no errors occurred.
 */
async function updateRoles(interaction, id) {
    // Do not use getOrCreate because if null, they will have no roles
    const user = getUserInfo(id);
    if (!user) {
        return [];
    }
    return await updateRolesFromUser(interaction, user);
}

/**
 * Updates all users' roles dependign on how many feedback points they each have.
 * @param {CommandInteraction} interaction The interaction to update roles from.
 * @return {EmbedBuilder} Response embed, indicating update success or failure.
 */
async function updateAllUsersRoles(interaction) {
    const allUsers = await Users.findAll();
    for (const user of allUsers) {
        const errorEmbeds = await updateRoles(interaction, user.user_id);
        if (errorEmbeds.length > 0) {
            // Errored
            return errorEmbeds[0].setDescription(constants.UPDATE_ALL_ROLES_ERROR);
        }
    }
    // Success
    const successEmbed = new EmbedBuilder().setTimestamp().setDescription(constants.UPDATE_ALL_ROLES_SUCCESS).setColor(Colors.Green);
    return successEmbed;
}

module.exports = {
    getUserInfo,
    getUsersWithInfo,
    getPointsFromUser,
    getPoints,
    getIsBlocked,
    getAllowPings,
    getRulesAccepted,
    setPoints,
    setIsBlocked,
    setAllowPings,
    setRulesAccepted,
    updateRolesFromUser,
    updateRoles,
    updateAllUsersRoles,

    /**
     * Initialize users collection from database.
     */
    async init() {
        const storedUsers = await Users.findAll()
        storedUsers.forEach(user => users.set(user.user_id, user));
    },
}