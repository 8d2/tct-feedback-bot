const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, 
    SlashCommandStringOption, SlashCommandRoleOption, PermissionFlagsBits, Colors, ChannelType } = require("discord.js");

const { handleSubcommandExecute } = require("../handlers/commands.js");
const constants = require("../helpers/constants.js");
const settingsMethods = require("../helpers/settingsMethods.js");
const messageMethods = require("../helpers/messageMethods.js");
const { pluralize } = require('../helpers/util.js');

// Constants
const CHANNEL_OPTION_NAME = "feedbackchannel";
const FORUM_TAG_OPTION_NAME = "forumtag";
const REQUIREMENT_OPTION_NAME = "requirement";
const ROLE_OPTION_NAME = "role";
const ROLE_TYPE_OPTION_NAME = "roletype";

const ROLE_TYPES = [
    {name: "regular", value: "regular"},
    {name: "veteran", value: "veteran"}
];

const SET_CHANNEL_COMMAND_NAME = "setchannel";
const SET_FORUM_TAG_COMMAND_NAME = "setforumtag";
const SET_REQUIREMENT_COMMAND_NAME = "setrequirement";
const SET_ROLE_COMMAND_NAME = "setrole";
const GET_SETTINGS_COMMAND_NAME = "settings";

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
        const newRequirement = interaction.options.getInteger(REQUIREMENT_OPTION_NAME);
        settingsMethods.setRoleRequirement(roleType, newRequirement);
        
        messageEmbed.setDescription(`The requirement for the ${roleType} feedbacker role has been set to ${pluralize(newRequirement, "point")}.`);
        messageEmbed.setColor(Colors.Green);
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
        const tag = await settingsMethods.getFeedbackForumTagId();
        const rolesMessage = await messageMethods.getRoleRequirementMessage(interaction, true);
        messageEmbed.setDescription(
            "## Admin Settings\n" +
            `Feedback Channel: ${channel ?? constants.OPTION_NULL}\n` +
            `Feedback Tag: \`${tag ?? constants.OPTION_NULL_NO_FORMAT}\`\n` +
            `Feedbacker Roles: ${rolesMessage ? "\n" + rolesMessage : constants.OPTION_NULL}`
        );
        messageEmbed.setColor(Colors.DarkVividPink);
        return true;
    }
    
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("administrator commands")
        // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        
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
        )
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName(SET_ROLE_COMMAND_NAME)
            .setDescription("Sets the role that is obtained for reaching specific feedback point requirements.")
            .addStringOption(new SlashCommandStringOption()
                .setName(ROLE_TYPE_OPTION_NAME)
                .setDescription("The role type to set")
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
            .setDescription("Show the current settings.")
        ),

    async execute(interaction) {
        handleSubcommandExecute(interaction, COMMAND_FUNCTIONS);
    },
};
