const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, 
    SlashCommandBooleanOption, SlashCommandRoleOption, PermissionFlagsBits, EmbedBuilder, Colors, MessageFlags, ChannelType }
    = require("discord.js");

// Constants
const CHANNEL_OPTION_NAME = "feedbackchannel";
const REQUIREMENT_OPTION_NAME = "requirement";
const ROLE_OPTION_NAME = "role";
const SET_VETERAN_OPTION_NAME = "setveteranrequirement";
const SET_VETERAN_ROLE_OPTION_NAME = "setveteranrole";

const SET_CHANNEL_COMMAND_NAME = "setchannel";
const SET_REQUIREMENT_COMMAND_NAME = "setrequirement";
const SET_ROLE_COMMAND_NAME = "setrole";

const EPHEMERAL_FLAG = MessageFlags.Ephemeral

const COMMAND_FUNCTIONS = {
    
    /**
     * Handles the '/admin setchannel' command.
     * @param {CommandInteraction} the interaction that used this command
     * @param {EmbedBuilder} the embed to modify and reply with
     * @return {boolean} true if the command succeeded, false if it failed.
     */
    [SET_CHANNEL_COMMAND_NAME]: async function handleSetChannel(interaction, messageEmbed) {
        const feedbackChannel = interaction.options.getChannel(CHANNEL_OPTION_NAME);
        
        messageEmbed.setDescription(`${feedbackChannel} has been set as the feedback forum channel.`);
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
        const settingVeteranReq = interaction.options.getBoolean(SET_VETERAN_OPTION_NAME);
        const newRequirement = interaction.options.getInteger(REQUIREMENT_OPTION_NAME);
        
        if (settingVeteranReq) {
            // points doesn't singularize with the argument as 1, but this is such a small and unlikely scenario so i won't fix
            messageEmbed.setDescription(`The requirement for the veteran feedback role has been set to ${newRequirement} points.`);
        }
        else {
            messageEmbed.setDescription(`The requirement for the regular feedback role has been set to ${newRequirement} points.`);
        }
        
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
        const settingVeteranReq = interaction.options.getBoolean(SET_VETERAN_ROLE_OPTION_NAME);
        const newRole = interaction.options.getRole(ROLE_OPTION_NAME);
        
        if (settingVeteranReq) {
            messageEmbed.setDescription(`The veteran feedbacker role has been set to ${newRole}.`);
        }
        else {
            messageEmbed.setDescription(`The regular feedbacker role has been set to ${newRole}.`);
        }
        
        messageEmbed.setColor(Colors.Green);
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
            .setName(SET_REQUIREMENT_COMMAND_NAME)
            .setDescription("Sets the feedback point requirement to obtain a specific role.")
            .addBooleanOption(new SlashCommandBooleanOption()
                .setName(SET_VETERAN_OPTION_NAME)
                .setDescription("If true, the veteran requirement will be set. Sets the regular requirement otherwise.") // constrained to 100 chars, can't have proper wording
                .setRequired(true)
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
            .addBooleanOption(new SlashCommandBooleanOption()
                .setName(SET_VETERAN_ROLE_OPTION_NAME)
                .setDescription("If true, the veteran role will be set. Sets the regular role otherwise.")
                .setRequired(true)
            )
            .addRoleOption(new SlashCommandRoleOption()
                .setName(ROLE_OPTION_NAME)
                .setDescription("The role to use for the point requirement.")
                .setRequired(true)
            )
        ),

    async execute(interaction) {

        const subcommandName = interaction.options.getSubcommand();
        let newEmbed = new EmbedBuilder().setTimestamp().setDescription("This command has not been fully implemented.");
        let successful = false;
        
        // call the function if the subcommand name is a key in the function hash map
        if (subcommandName in COMMAND_FUNCTIONS) {
            successful = await COMMAND_FUNCTIONS[subcommandName](interaction, newEmbed);
        }
        
        if (successful) {
            await interaction.reply({embeds: [newEmbed]});
        }
        else {
            await interaction.reply({embeds: [newEmbed], flags: EPHEMERAL_FLAG});
        }
    },
};
