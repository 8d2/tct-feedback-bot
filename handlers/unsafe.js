// Handles performing actions that may result in an error, possibly due to lack of permissions. 

const { Colors } = require("discord.js");

const constants = require("../helpers/constants.js")

/**
 * Handles the action of sending a embed to a channel through a command.
 * Accounts for lack of permissions in failing to send the message.
 * @param {GuildBasedChannel} channel Channel to send message in.
 * @param {InteractionReplyOptions} replyOptions Options for sending the message.
 * @param {EmbedBuilder} responseEmbed The embed used to reply to the user running the command.
 */
async function handleSendMessage(channel, replyOptions, responseEmbed) {
    try {
        await channel.send(replyOptions);
        responseEmbed.setDescription(constants.MESSAGE_SENT_CONFIRM_MESSAGE);
        responseEmbed.setColor(Colors.Green);
    }
    catch (error) {
        responseEmbed.setDescription(
            // Missing Permissions
            error.code == constants.MISSING_PERMISSIONS_CODE ? constants.MESSAGE_SENT_PERMISSION_FAILED_MESSAGE :
            // Other error
            constants.MESSAGE_SENT_FAILED_MESSAGE
        );
        responseEmbed.setColor(Colors.Red);
    };
}

/**
 * Tries to add a role to a user, returning a error message if failed.
 * @param {User} user The user to add role to.
 * @param {Role} role The role to add.
 * @returns {string} Error message if failed to add. Null if succeeded.
 */
async function handleAddRole(user, role) {
    try {
        await user.roles.add(role);
    }
    catch (error) {
        console.error(error);
        return `Could not add ${role} to ${user}` + (error.code == constants.MISSING_ACCESS_CODE ? " due to a lack of permissions" : "") + ".";
    }
    return null;
}

/**
 * Tries to remove a role from a user if they have it, returning a error message if failed.
 * @param {User} user The user to add role to.
 * @param {Role} role The role to add.
 * @returns {string} Error message if failed to add. Null if succeeded.
 */
async function handleRemoveRole(user, role) {
    try {
        await user.roles.remove(role);
    }
    catch (error) {
        return `Could not remove ${role} from ${user}` + (error.code == constants.MISSING_ACCESS_CODE ? " due to a lack of permissions" : "") + ".";
    }
    return null;
}

module.exports = {
    handleSendMessage,
    handleAddRole,
    handleRemoveRole
}