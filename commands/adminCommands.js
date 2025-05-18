const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, 
    SlashCommandStringOption, SlashCommandRoleOption, SlashCommandBooleanOption, PermissionFlagsBits,
    Colors, ChannelType, HeadingLevel, inlineCode, heading } = require("discord.js");

const { handleSubcommandExecute } = require("../handlers/commands.js");
const constants = require("../helpers/constants.js");
const messageMethods = require("../helpers/messageMethods.js");
const settingsMethods = require("../helpers/settingsMethods.js");
const userMethods = require("../helpers/userMethods.js");
const { pluralize } = require('../helpers/util.js');

// Constants
const CHANNEL_OPTION_NAME = "feedbackchannel";
const FORUM_TAG_OPTION_NAME = "forumtag";
const REQUIREMENT_OPTION_NAME = "requirement";
const ROLE_OPTION_NAME = "role";
const ROLE_TYPE_OPTION_NAME = "roletype";
const UPDATE_ALL_OPTION_NAME = "updateallroles";
const PROTECTED_OPTION_NAME = "protected";

const ROLE_TYPES = [
    {name: "regular", value: "regular"},
    {name: "veteran", value: "veteran"}
];

const SET_CHANNEL_COMMAND_NAME = "setchannel";
const SET_FORUM_TAG_COMMAND_NAME = "setforumtag";
const SET_REQUIREMENT_COMMAND_NAME = "setrequirement";
const SET_ROLE_COMMAND_NAME = "setrole";
const GET_SETTINGS_COMMAND_NAME = "settings";
const SET_STAFF_PROTECTED_COMMAND_NAME = "setstaffprotection";

const COMMAND_FUNCTIONS = {
    
    /**
     * Handles the '/admin setchannel' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [SET_CHANNEL_COMMAND_NAME]: async function handleSetChannel(interaction, messageEmbed) {
        const feedbackChannel = interaction.options.getChannel(CHANNEL_OPTION_NAME);
        settingsMethods.setFeedbackChannelId(feedbackChannel.id);
        messageEmbed.setDescription(`${feedbackChannel} has been set as the feedback forum channel.`);
        messageEmbed.setColor(Colors.Green);
        return true;
    },

    /**
     * Handles the '/admin setforumtag' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [SET_FORUM_TAG_COMMAND_NAME]: async function handleSetForumTag(interaction, messageEmbed) {
        const forumTagId = interaction.options.getString(FORUM_TAG_OPTION_NAME);
        settingsMethods.setFeedbackForumTagId(forumTagId);
        messageEmbed.setDescription(`${forumTagId} has been set as the feedback tag.`);
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
        const channel = await settingsMethods.getFeedbackChannel(interaction.guild);
        const tag = settingsMethods.getFeedbackForumTagId();
        const rolesMessage = await messageMethods.getRoleRequirementMessage(interaction, true);
        const staffIsProtected = await settingsMethods.getStaffIsProtected();
        
        messageEmbed.setDescription(
            heading("Admin Settings:", HeadingLevel.Two) +
            `\nFeedback Channel: ${channel ?? constants.OPTION_NULL}\n` +
            `Feedback Tag: ${inlineCode(tag ?? constants.OPTION_NULL_NO_FORMAT)}\n` +
            `Feedbacker Roles: ${rolesMessage ? "\n" + rolesMessage : constants.OPTION_NULL}\n` +
            `Staff is protected: ${staffIsProtected}`
        );
        messageEmbed.setColor(Colors.DarkPurple);
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
            .setName(SET_CHANNEL_COMMAND_NAME)
            .setDescription("Sets a forum channel as the feedback channel, allowing feedback contracts to be posted.")
            .addChannelOption(new SlashCommandChannelOption()
                .setName(CHANNEL_OPTION_NAME)
                .setDescription("The channel to set as the feedback channel")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildForum)
            )
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(SET_FORUM_TAG_COMMAND_NAME)
            .setDescription("Sets a forum tag as the \"open for feedback\" tag, allowing feedback contracts to be posted.")
            .addStringOption(new SlashCommandStringOption()
                .setName(FORUM_TAG_OPTION_NAME)
                .setDescription("The ID of the forum tag to set as the \"open for feedback\" tag.")
                .setRequired(true)
            )
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
