const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption, SlashCommandIntegerOption, 
    SlashCommandChannelOption, EmbedBuilder, ChannelType, PermissionFlagsBits, Colors }
    = require("discord.js");

const { handleSubcommandExecute } = require("../handlers/commands.js")
const { handleSendMessage } = require("../handlers/messages.js")
const constants = require("../helpers/constants.js")
const messageMethods = require("../helpers/messageMethods.js")
const userMethods = require("../helpers/userMethods.js")

// Constants
const USER_OPTION_NAME = "user";
const POINTS_OPTION_NAME = "points";
const CHANNEL_OPTION_NAME = "channel";

const BLOCK_COMMAND_NAME = "block";
const SET_POINTS_COMMAND_NAME = "setpoints";
const UNBLOCK_COMMAND_NAME = "unblock";
const DISPLAY_INFO_COMMAND_NAME = "displaybotinfo";

const COMMAND_FUNCTIONS = {
  
    /**
     * Handles the '/mod block' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [BLOCK_COMMAND_NAME]: async function handleBlock(interaction, messageEmbed) {
        const blockee = interaction.options.getUser(USER_OPTION_NAME);
        const isBlocked = userMethods.getIsBlocked(blockee.id);
        
        if (isBlocked) {
            messageEmbed.setDescription(`${blockee} is already blocked.`);
            messageEmbed.setColor(Colors.Yellow);
        }
        else {
            userMethods.setIsBlocked(blockee.id, true);
            messageEmbed.setDescription(`${blockee} has been blocked from creating feedback contracts.`);
            messageEmbed.setColor(Colors.Red);
        }
        
        return !isBlocked;
    },

    /**
     * Handles the '/mod unblock' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [UNBLOCK_COMMAND_NAME]: async function handleUnblock(interaction, messageEmbed) {
        const unblockee = interaction.options.getUser(USER_OPTION_NAME);
        const isBlocked = userMethods.getIsBlocked(unblockee.id);
        
        if (isBlocked) {
            userMethods.setIsBlocked(unblockee.id, false);
            messageEmbed.setDescription(`${unblockee} has been unblocked and can now create feedback contracts.`);
            messageEmbed.setColor(Colors.Green);
        }
        else {
            messageEmbed.setDescription(`${unblockee} isn't blocked.`);
            messageEmbed.setColor(Colors.Yellow);
        }
        
        return isBlocked;
    },

    /**
     * Handles the '/mod setpoints' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [SET_POINTS_COMMAND_NAME]: async function handleSetPoints(interaction, messageEmbed) {
        const user = interaction.options.getUser(USER_OPTION_NAME);
        const points = interaction.options.getInteger(POINTS_OPTION_NAME);
        userMethods.setPoints(user.id, points);
        messageEmbed.setDescription(`${user} now has ${points} points.`);
        messageEmbed.setColor(Colors.Green);
        return true;
    },

    /**
     * Handles the '/mod displaybotinfo' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [DISPLAY_INFO_COMMAND_NAME]: async function handleDisplayInfo(interaction, messageEmbed) {
        const feedbackChannel = interaction.options.getChannel(CHANNEL_OPTION_NAME) ?? interaction.channel;
        const messages = await messageMethods.getPointsInfoDisplayMessages(interaction);
        const titleEmbed = new EmbedBuilder()
            .setDescription(messages[0])
            .setColor(Colors.Purple);
        const gettingFeedbackEmbed = new EmbedBuilder()
            .setDescription(messages[1])
            .setColor(Colors.Blue);
        const givingFeedbackEmbed = new EmbedBuilder()
            .setDescription(messages[2])
            .setColor(Colors.Aqua);
        await handleSendMessage(feedbackChannel, {embeds: [titleEmbed, gettingFeedbackEmbed, givingFeedbackEmbed]}, messageEmbed)
        return false;
    }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mod")
        .setDescription("Moderator commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(BLOCK_COMMAND_NAME)
            .setDescription("Blocks a user from creating feedback contracts")
            .addUserOption(new SlashCommandUserOption()
                .setName(USER_OPTION_NAME)
                .setDescription("The user to block")
                .setRequired(true)
            )
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(UNBLOCK_COMMAND_NAME)
            .setDescription("Unblocks a user, allowing them to create feedback contracts.")
            .addUserOption(new SlashCommandUserOption()
                .setName(USER_OPTION_NAME)
                .setDescription("The user to unblock")
                .setRequired(true)
            )
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(SET_POINTS_COMMAND_NAME)
            .setDescription("Set how many feedback points a user has.")
            .addUserOption(new SlashCommandUserOption()
                .setName(USER_OPTION_NAME)
                .setDescription("The user to set points of")
                .setRequired(true)
            )
            .addIntegerOption(new SlashCommandIntegerOption()
                .setName(POINTS_OPTION_NAME)
                .setDescription("Points to set user to")
                .setRequired(true)
                .setMinValue(0)
            )
        )
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(DISPLAY_INFO_COMMAND_NAME)
            .setDescription("Show bot message for gaining and using feedback points")
            .addChannelOption(new SlashCommandChannelOption()
                .setName(CHANNEL_OPTION_NAME)
                .setDescription("The channel to post the message in. If empty, this channel")
                .addChannelTypes(
                    ChannelType.GuildAnnouncement,
                    ChannelType.GuildMedia,
                    ChannelType.GuildText,
                    ChannelType.PrivateThread,
                    ChannelType.PublicThread
                )
            )
        ),

    async execute(interaction) {
        handleSubcommandExecute(interaction, COMMAND_FUNCTIONS);
    },
};
