// Stores settings set by admin commands, including getter + setter methods.

const { Collection } = require('discord.js');
const { SETTINGS_MAIN_IDENTIFIER, Roles, Settings } = require('../dbObjects.js');

let settings;

/**
 * Gets the feedback channel id.
 * @returns {string?} Currently set feedback channel ID. Null if not set.
 */
function getFeedbackChannelId() {
    return settings ? settings.feedback_channel_id : null;
}

/**
 * Sets the feedback channel to the id.
 * @param {string} id Channel ID to set.
 */
function setFeedbackChannelId(id) {
    if (settings) {
        settings.feedback_channel_id = id;
        settings.save();
    }
}

/**
 * Gets the "open for feedback" forum tag id.
 * @returns {string?} Currently set feedback channel ID. Null if not set.
 */
function getFeedbackForumTagId() {
    return settings ? settings.feedback_tag_id : null;
}

/**
 * Sets the "open for feedback" tag to the id.
 * @param {string} id Channel ID to set.
 */
function setFeedbackForumTagId(id) {
    if (settings) {
        settings.feedback_tag_id = id;
        settings.save();
    }
}

/**
 * Get roles for settings.
 * @returns {[Roles]} Roles. Empty if no roles set.
 */
async function getRoles() {
    return settings ? await settings.getRoles() : [];
}

/**
 * Get role from given role type.
 * @param {string} roleType Type of role to get.
 * @returns {Roles?} Role. Null if no role found.
 */
async function getRole(roleType) {
    return settings ? settings.getRole(roleType) : null;
}

/**
 * Get role from given role type, or create a new role if not found.
 * @param {string} roleType Type of role to get.
 * @returns {Roles} Role.
 */
async function getOrCreateRole(roleType) {
    const role = await getRole(roleType);
    if (role) {
        return role;
    }
    const newRole = await Roles.create({role_type: roleType});
    return newRole;
}

/**
 * Gets the id of the role with the role type.
 * @param {string} roleType Type of role to get.
 * @returns {string?} Role ID. Null if not set.
 */
async function getRoleId(roleType, roleId) {
    const role = await getOrCreateRole(roleType);
    return role.role_id;
}

/**
 * Sets the id of the role.
 * @param {Roles} role Role to set.
 * @param {string} roleId Role ID to set.
 * @returns {Roles} Role.
 */
async function setRoleIdFromRole(role, roleId) {
    role.role_id = roleId;
    return role.save();
}

/**
 * Sets the id of the role with the role type.
 * @param {string} roleType Type of role to set.
 * @param {string} roleId Role ID to set.
 * @returns {Roles} Role.
 */
async function setRoleId(roleType, roleId) {
    const role = await getOrCreateRole(roleType);
    return setRoleIdFromRole(role, roleId);
}

/**
 * Gets the requirement for the role with the role type.
 * @param {string} roleType Type of role to get.
 * @returns {int?} Role requirement. Null if not set.
 */
async function getRoleRequirement(roleType, roleRequirement) {
    const role = await getOrCreateRole(roleType);
    return role.role_requirement;
}

/**
 * Sets the requirement for the role.
 * @param {Roles} role Role to set.
 * @param {int} roleRequirement Role requirement to set.
 * @returns {Roles} Role.
 */
async function setRoleRequirementFromRole(role, roleRequirement) {
    role.role_requirement = roleRequirement;
    return role.save();
}

/**
 * Sets the requirement of the role type.
 * @param {string} roleType Type of role to set.
 * @param {int} roleRequirement Role requirement to set.
 * @returns {Roles} Role.
 */
async function setRoleRequirement(roleType, roleRequirement) {
    const role = await getOrCreateRole(roleType);
    return setRoleRequirementFromRole(role, roleRequirement);
}

module.exports = {
    getFeedbackChannelId,
    setFeedbackChannelId,
    getFeedbackForumTagId,
    setFeedbackForumTagId,
    getRoles,
    getRole,
    getOrCreateRole,
    getRoleId,
    setRoleIdFromRole,
    setRoleId,
    getRoleRequirement,
    setRoleRequirementFromRole,
    setRoleRequirement,

    /**
     * Initialize main settings database.
     */
    async init() {
        settings = await Settings.findOne({
            where: { identifier: SETTINGS_MAIN_IDENTIFIER }
        });
    }
}