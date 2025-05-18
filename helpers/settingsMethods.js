// Stores settings set by admin commands, including getter + setter methods.

const { Collection } = require('discord.js');
const { SETTINGS_MAIN_IDENTIFIER, Channels, Roles, Settings, Tags } = require('../dbObjects.js');

let settings;

/**
 * Gets the feedback channels for settings in database.
 * @returns {[Channels]} Database channels. Empty if no channels set.
 */
async function getDatabaseFeedbackChannels() {
    return settings ? await settings.getChannels() : [];
}

/**
 * Gets the feedback channels set in settings from the guild.
 * @param {Guild} guild The guild to get channel from.
 * @returns {[GuildBaseChannel]} Feedback channel. Empty if no channels set.
 */
async function getFeedbackChannels(guild) {
    const feedbackChannels = await getDatabaseFeedbackChannels();
    return feedbackChannels.map(channel => guild.channels.cache.get(channel_id));
}

/**
 * Adds the feedback channel of the id.
 * @param {string} id Channel ID to add.
 * @returns {bool} Whether the channel ID was added. False if already in database.
 */
async function addFeedbackChannelId(id) {
    if (settings) {
        const added = await settings.addChannel(id);
        if (added) {
            settings.save();
        }
        return added;
    }
    return false;
}

/**
 * Removes the feedback channel of the id.
 * @param {string} id Channel ID to remove.
 * @returns {bool} Whether the channel ID was removed. False if not in database.
 */
async function removeFeedbackChannelId(id) {
    if (settings) {
        const removed = await settings.removeChannel(id);
        if (removed) {
            settings.save();
        }
        return removed;
    }
    return false;
}

/**
 * Gets the all forum tags for settings in database.
 * @returns {[Tags]} Database tags. Empty if no tags set.
 */
async function getDatabaseFeedbackForumTags() {
    return settings ? await settings.getTags() : [];
}

/**
 * Gets the all forum tag ids for settings in database.
 * @returns {[int]} Tag IDs. Empty if no tags set.
 */
async function getFeedbackForumTagIds() {
    const tags = await getDatabaseFeedbackForumTags();
    return tags.map(tag => tag.tag_id);
}

/**
 * Adds a forum tag of the id.
 * @param {string} id Tag ID to add.
 * @returns {bool} Whether the tag ID was added. False if already in database.
 */
async function addFeedbackForumTagId(id) {
    if (settings) {
        const added = await settings.addTag(id);
        if (added) {
            settings.save();
        }
        return added;
    }
    return false;
}

/**
 * Remove a forum tag of the id.
 * @param {string} id Tag ID to add.
 * @returns {bool} Whether the tag ID was removed. False if not in database.
 */
async function removeFeedbackForumTagId(id) {
    if (settings) {
        const removed = await settings.removeTag(id);
        if (removed) {
            settings.save();
        }
        return removed;
    }
    return false;
}

/**
 * Get roles for settings in database.
 * @returns {[Roles]} Roles. Empty if no roles set.
 */
async function getDatabaseRoles() {
    return settings ? await settings.getRoles() : [];
}

/**
 * Get role from given role type in database.
 * @param {string} roleType Type of role to get.
 * @returns {Roles?} Role. Null if no role found.
 */
async function getDatabaseRole(roleType) {
    return settings ? settings.getRole(roleType) : null;
}

/**
 * Get role from given role type, or create a new role if not found.
 * @param {string} roleType Type of role to get.
 * @returns {Roles} Role.
 */
async function getOrCreateDatabaseRole(roleType) {
    const role = await getDatabaseRole(roleType);
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
    const role = await getOrCreateDatabaseRole(roleType);
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

/**
 * Returns whether staff members are protected from data modifying commands.
 * This includes /mod setpoints, /mod block.
 * @returns {boolean} whether staff is protected from data modifying commands.
 */
async function getStaffIsProtected() {
    return settings ? settings.staff_is_protected : true;
}

/**
 * Sets whether staff are protected from data modifying commands.
 * This includes /mod setpoints, /mod block.
 * @param {boolean} whether staff should be protected
 */
async function setStaffIsProtected(protect) {
    if (settings) {
        settings.staff_is_protected = protect;
        settings.save();
    }
}

module.exports = {
    getDatabaseFeedbackChannels,
    getFeedbackChannels,
    addFeedbackChannelId,
    removeFeedbackChannelId,
    getDatabaseFeedbackForumTags,
    getFeedbackForumTagIds,
    addFeedbackForumTagId,
    removeFeedbackForumTagId,
    getDatabaseRoles,
    getDatabaseRole,
    getOrCreateDatabaseRole,
    getRoleId,
    setRoleIdFromRole,
    setRoleId,
    getRoleRequirement,
    setRoleRequirementFromRole,
    setRoleRequirement,
    getStaffIsProtected,
    setStaffIsProtected,

    /**
     * Initialize main settings database.
     */
    async init() {
        settings = await Settings.findOne({
            where: { identifier: SETTINGS_MAIN_IDENTIFIER }
        });
    }
}
