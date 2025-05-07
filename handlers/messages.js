
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
        if (error.code == 50013) {
            // Error code for failed permissions
            responseEmbed.setDescription(constants.MESSAGE_SENT_PERMISSION_FAILED_MESSAGE);
        }
        else {
            // Some other error
            responseEmbed.setDescription(constants.MESSAGE_SENT_FAILED_MESSAGE);
        }
        responseEmbed.setColor(Colors.Red);
    }
}

module.exports = {
    handleSendMessage
}