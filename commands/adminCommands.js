const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, 
    SlashCommandStringOption, SlashCommandRoleOption, SlashCommandBooleanOption, PermissionFlagsBits,
    Colors, ChannelType, HeadingLevel, bold, inlineCode, heading } = require("discord.js");

const { handleSubcommandExecute } = require("../handlers/commands.js");
const constants = require("../helpers/constants.js");
const messageMethods = require("../helpers/messageMethods.js");
const settingsMethods = require("../helpers/settingsMethods.js");
const userMethods = require("../helpers/userMethods.js");
const { pluralize, concatList, getTimeDisplay } = require('../helpers/util.js');

// Constants
const CHANNEL_OPTION_NAME = "feedbackchannel";
const FORUM_TAG_OPTION_NAME = "forumtag";
const REQUIREMENT_OPTION_NAME = "requirement";
const ROLE_OPTION_NAME = "role";
const ROLE_TYPE_OPTION_NAME = "roletype";
const UPDATE_ALL_OPTION_NAME = "updateallroles";
const PROTECTED_OPTION_NAME = "protected";
const COOLDOWN_OPTION_NAME = "cooldown";

const ROLE_TYPES = [
    {name: "regular", value: "regular"},
    {name: "veteran", value: "veteran"}
];

const ADD_CHANNEL_COMMAND_NAME = "addchannel";
const REMOVE_CHANNEL_COMMAND_NAME = "removechannel";
const REMOVE_ALL_CHANNELS_COMMAND_NAME = "removeallchannels";
const ADD_FORUM_TAG_COMMAND_NAME = "addforumtag";
const REMOVE_FORUM_TAG_COMMAND_NAME = "removeforumtag";
const REMOVE_ALL_TAGS_COMMAND_NAME = "removeallforumtags";
const SET_REQUIREMENT_COMMAND_NAME = "setrequirement";
const SET_ROLE_COMMAND_NAME = "setrole";
const GET_SETTINGS_COMMAND_NAME = "settings";
const SET_STAFF_PROTECTED_COMMAND_NAME = "setstaffprotection";
const SET_CONTRACT_COOLDOWN_COMMAND_NAME = "setcontractcooldown";

const COMMAND_FUNCTIONS = {
    
    /**
     * Handles the '/admin addchannel' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [ADD_CHANNEL_COMMAND_NAME]: async function handleAddChannel(interaction, messageEmbed) {
        const feedbackChannel = interaction.options.getChannel(CHANNEL_OPTION_NAME);
        const added = await settingsMethods.addFeedbackChannelId(feedbackChannel.id);
        if (!added) {
            // Already in database
            messageEmbed.setDescription(`${feedbackChannel} is already a feedback forum channel.`);
            messageEmbed.setColor(Colors.Yellow);
            return false;
        };
        messageEmbed.setDescription(`${feedbackChannel} has been added as a feedback forum channel.`);
        messageEmbed.setColor(Colors.Green);
        return true;
    },
    
    /**
     * Handles the '/admin removechannel' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [REMOVE_CHANNEL_COMMAND_NAME]: async function handleRemoveChannel(interaction, messageEmbed) {
        const feedbackChannel = interaction.options.getChannel(CHANNEL_OPTION_NAME);
        const removed = await settingsMethods.removeFeedbackChannelId(feedbackChannel.id);
        if (!removed) {
            // Not in database
            messageEmbed.setDescription(`${feedbackChannel} is not a feedback forum channel.`);
            messageEmbed.setColor(Colors.Yellow);
            return false;
        };
        messageEmbed.setDescription(`${feedbackChannel} has been removed as a feedback forum channel.`);
        messageEmbed.setColor(Colors.Green);
        return true;
    },
    
    /**
     * Handles the '/admin removeallchannels' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [REMOVE_ALL_CHANNELS_COMMAND_NAME]: async function handleRemoveAllChannels(interaction, messageEmbed) {
        const removed = await settingsMethods.removeAllFeedbackChannels();
        if (!removed) {
            // None removed
            messageEmbed.setDescription("No feedback channels could be removed.");
            messageEmbed.setColor(Colors.Yellow);
            return false;
        };
        messageEmbed.setDescription("All feedback channels have been removed.");
        messageEmbed.setColor(Colors.Green);
        return true;
    },

    /**
     * Handles the '/admin addforumtag' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [ADD_FORUM_TAG_COMMAND_NAME]: async function handleSetForumTag(interaction, messageEmbed) {
        const forumTagId = interaction.options.getString(FORUM_TAG_OPTION_NAME);
        
        if (forumTagId.length > constants.ID_CHARACTER_LIMIT) {
            messageEmbed.setDescription(constants.ID_CHARACTER_LIMIT_DESC);
            messageEmbed.setColor(Colors.Yellow);
            return false;
        }
        
        const added = await settingsMethods.addFeedbackForumTagId(forumTagId);
        
        if (!added) {
            // Already in database
            messageEmbed.setDescription(`${forumTagId} is already a feedback forum tag.`);
            messageEmbed.setColor(Colors.Yellow);
            return false;
        };
        messageEmbed.setDescription(`${forumTagId} has been added as a feedback forum tag.`);
        messageEmbed.setColor(Colors.Green);
        return true;
    },

    /**
     * Handles the '/admin removeforumtag' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [REMOVE_FORUM_TAG_COMMAND_NAME]: async function handleSetForumTag(interaction, messageEmbed) {
        const forumTagId = interaction.options.getString(FORUM_TAG_OPTION_NAME);
        const removed = await settingsMethods.removeFeedbackForumTagId(forumTagId);
        if (!removed) {
            // Not in database
            messageEmbed.setDescription(`${forumTagId} is not a feedback forum tag.`);
            messageEmbed.setColor(Colors.Yellow);
            return false;
        };
        messageEmbed.setDescription(`${forumTagId} has been removed as a feedback forum tag.`);
        messageEmbed.setColor(Colors.Green);
        return true;
    },
    
    /**
     * Handles the '/admin removeallforumtags' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [REMOVE_ALL_TAGS_COMMAND_NAME]: async function handleRemoveAllChannels(interaction, messageEmbed) {
        const removed = await settingsMethods.removeAllFeedbackForumTags();
        if (!removed) {
            // None removed
            messageEmbed.setDescription("No feedback forum tags could be removed.");
            messageEmbed.setColor(Colors.Yellow);
            return false;
        };
        messageEmbed.setDescription("All feedback forum tags have been removed.");
        messageEmbed.setColor(Colors.Green);
        return true;
    },
    
    /**
     * Handles the '/admin setrequirement' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [SET_REQUIREMENT_COMMAND_NAME]: async function handleSetRequirement(interaction, messageEmbed) {
        const roleType = interaction.options.getString(ROLE_TYPE_OPTION_NAME);
        const updateAllRoles = interaction.options.getBoolean(UPDATE_ALL_OPTION_NAME);
        const newRequirement = interaction.options.getInteger(REQUIREMENT_OPTION_NAME);
        settingsMethods.setRoleRequirement(roleType, newRequirement);

        messageEmbed.setDescription(`The requirement for the ${roleType} feedbacker role has been set to ${pluralize(newRequirement, "point")}.`);
        messageEmbed.setColor(Colors.Green);
        if (updateAllRoles) {
            // Only update if option provided
            const responseEmbed = await userMethods.updateAllUsersRoles(interaction);
            return {followUpEmbeds: [responseEmbed]};
        }
        return true;
    },
    
    /**
     * Handles the '/admin setrole' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [SET_ROLE_COMMAND_NAME]: async function handleSetRole(interaction, messageEmbed) {
        const roleType = interaction.options.getString(ROLE_TYPE_OPTION_NAME);
        const newRole = interaction.options.getRole(ROLE_OPTION_NAME);
        settingsMethods.setRoleId(roleType, newRole.id)

        messageEmbed.setDescription(`The ${roleType} feedbacker role has been set to ${newRole}.`);
        messageEmbed.setColor(Colors.Green);
        return true;
    },
    
    /**
     * Handles the '/admin settings' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [GET_SETTINGS_COMMAND_NAME]: async function handleGetSettings(interaction, messageEmbed) {
        const channels = await settingsMethods.getFeedbackChannels(interaction.guild);
        const tagIds = await settingsMethods.getFeedbackForumTagIds();
        const rolesMessage = await messageMethods.getRoleRequirementMessage(interaction, true);
        const staffIsProtected = await settingsMethods.getStaffIsProtected();
        
        messageEmbed.setDescription(
            heading("Admin Settings:", HeadingLevel.Two) +
            `\nFeedback Channels: ${concatList(channels)}\n` +
            `Feedback Tags: ${inlineCode(concatList(tagIds, constants.OPTION_NULL_NO_FORMAT))}\n` +
            `Feedbacker Roles: ${rolesMessage ? "\n" + rolesMessage : constants.OPTION_NULL}\n` +
            `Staff Protected: ${bold(staffIsProtected)}`
        );
        messageEmbed.setColor(Colors.DarkPurple);
        return true;
    },
    
    /**
     * Handles the '/admin setcontractcooldown' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [SET_CONTRACT_COOLDOWN_COMMAND_NAME]: async function handleSetContractCooldown(interaction, messageEmbed) {
        const cooldown = interaction.options.getInteger(COOLDOWN_OPTION_NAME);
        await settingsMethods.setContractCooldown(cooldown);
        messageEmbed.setColor(Colors.Green);
        messageEmbed.setDescription(`The cooldown for posting contracts in the same thread is now ${inlineCode(getTimeDisplay(cooldown))}.`)
        return true;
    },
    
    /**
     * Handles the '/admin setstaffprotection' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [SET_STAFF_PROTECTED_COMMAND_NAME]: async function handleSetStaffProtection(interaction, messageEmbed) {
        
        const protect = interaction.options.getBoolean(PROTECTED_OPTION_NAME);
        await settingsMethods.setStaffIsProtected(protect);
        
        messageEmbed.setColor(Colors.Green);
        if (protect) {
            messageEmbed.setDescription("Staff members are now protected from data modifying commands.");
        }
        else {
            messageEmbed.setDescription("Staff members are no longer protected from data modifying commands.");
        }
        
        return true;
    }
    
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("administrator commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(ADD_CHANNEL_COMMAND_NAME)
            .setDescription("Adds a forum channel as a feedback channel, allowing feedback contracts to be posted.")
            .addChannelOption(new SlashCommandChannelOption()
                .setName(CHANNEL_OPTION_NAME)
                .setDescription("The channel to add as a feedback channel")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildForum)
            )
        )
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(REMOVE_CHANNEL_COMMAND_NAME)
            .setDescription("Removes a forum channel as a feedback channel.")
            .addChannelOption(new SlashCommandChannelOption()
                .setName(CHANNEL_OPTION_NAME)
                .setDescription("The channel to remove as a feedback channel")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildForum)
            )
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(REMOVE_ALL_CHANNELS_COMMAND_NAME)
            .setDescription("Removes all current forum channels from being feedback channels.")
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(ADD_FORUM_TAG_COMMAND_NAME)
            .setDescription("Adds a forum tag as an \"open for feedback\" tag, allowing feedback contracts to be posted.")
            .addStringOption(new SlashCommandStringOption()
                .setName(FORUM_TAG_OPTION_NAME)
                .setDescription("The ID of the forum tag to add as an \"open for feedback\" tag.")
                .setRequired(true)
            )
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(REMOVE_FORUM_TAG_COMMAND_NAME)
            .setDescription("Removes a forum tag as an \"open for feedback\" tag.")
            .addStringOption(new SlashCommandStringOption()
                .setName(FORUM_TAG_OPTION_NAME)
                .setDescription("The ID of the forum tag to remove as an \"open for feedback\" tag.")
                .setRequired(true)
            )
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(REMOVE_ALL_TAGS_COMMAND_NAME)
            .setDescription("Removes all current forum tags from being \"open for feedback\" tags.")
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(SET_REQUIREMENT_COMMAND_NAME)
            .setDescription("Sets the feedback point requirement to obtain a specific role.")
            .addStringOption(new SlashCommandStringOption()
                .setName(ROLE_TYPE_OPTION_NAME)
                .setDescription("The role type to set requirement of")
                .setRequired(true)
                .setChoices(...ROLE_TYPES)
            )
            .addIntegerOption(new SlashCommandIntegerOption()
                .setName(REQUIREMENT_OPTION_NAME)
                .setDescription("The new requirement for the role")
                .setRequired(true)
                .setMinValue(1)
            )
            .addBooleanOption(new SlashCommandBooleanOption()
                .setName(UPDATE_ALL_OPTION_NAME)
                .setDescription("If true, all users' feedback roles will be updated. False by default.")
            )
        )
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(SET_ROLE_COMMAND_NAME)
            .setDescription("Sets the role that is obtained for reaching specific feedback point requirements.")
            .addStringOption(new SlashCommandStringOption()
                .setName(ROLE_TYPE_OPTION_NAME)
                .setDescription("The role type to set.")
                .setRequired(true)
                .setChoices(...ROLE_TYPES)
            )
            .addRoleOption(new SlashCommandRoleOption()
                .setName(ROLE_OPTION_NAME)
                .setDescription("The role to use for the point requirement.")
                .setRequired(true)
            )
        )
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(GET_SETTINGS_COMMAND_NAME)
            .setDescription("Show the current feedback bot admin settings.")
        )
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(SET_CONTRACT_COOLDOWN_COMMAND_NAME)
            .setDescription("Sets the cooldown for users to post a contract in the same thread.")
            .addIntegerOption(new SlashCommandIntegerOption()
                .setName(COOLDOWN_OPTION_NAME)
                .setDescription("Cooldown for posting a contract in seconds")
                .setMinValue(0)
                .setRequired(true)
            )
        )
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(SET_STAFF_PROTECTED_COMMAND_NAME)
            .setDescription("Sets whether staff are protected from data modifying commands (/mod setpoints, /mod block).")
            .addBooleanOption(new SlashCommandBooleanOption()
                .setName(PROTECTED_OPTION_NAME)
                .setDescription("Whether staff should be protected")
                .setRequired(true)
            )
        ),

    async execute(interaction) {
        handleSubcommandExecute(interaction, COMMAND_FUNCTIONS);
    },
};
