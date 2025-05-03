const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, 
    SlashCommandBooleanOption, PermissionFlagsBits, EmbedBuilder, Colors, MessageFlags, ChannelType }
    = require("discord.js");

// Constants
const CHANNEL_OPTION_NAME = "feedbackchannel";
const REQUIREMENT_OPTION_NAME = "newrequirement";
const SET_VETERAN_OPTION_NAME = "setveteranrequirement";

const SET_CHANNEL_COMMAND_NAME = "setchannel";
const SET_REQUIREMENT_COMMAND_NAME = "setrequirement";

const EPHEMERAL_FLAG = MessageFlags.Ephemeral

// Handles the '/admin setchannel' command.
// interaction: the interaction that used this command
// messageEmbed: the embed to modify and reply with
// returns false if the action failed.
async function handleSetChannel(interaction, messageEmbed) {
    const feedbackChannel = interaction.options.getChannel(CHANNEL_OPTION_NAME);
    
    messageEmbed.setDescription(`${feedbackChannel} has been set as the feedback forum channel.`);
    messageEmbed.setColor(Colors.Green);
    return true;
}

// Handles the '/admin setrequirement' command.
// interaction: the interaction that used this command
// messageEmbed: the embed to modify and reply with
// returns false if the action failed.
async function handleSetRequirement(interaction, messageEmbed) {
    const settingVeteranReq = interaction.options.getBoolean(SET_VETERAN_OPTION_NAME);
    const newRequirement = interaction.options.getInteger(REQUIREMENT_OPTION_NAME);
    
    if (settingVeteranReq) {
        messageEmbed.setDescription(`The requirement for the veteran feedback role has been set to ${newRequirement}.`);
    }
    else {
        messageEmbed.setDescription(`The requirement for the regular feedback role has been set to ${newRequirement}.`);
    }
    
    messageEmbed.setColor(Colors.Green);
    return true;
}

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
        ),

    async execute(interaction) {

        let newEmbed = new EmbedBuilder().setTimestamp();
        let successful = false;

        // action based on subcommand
        switch (interaction.options.getSubcommand()) {
            case (SET_CHANNEL_COMMAND_NAME):
                successful = handleSetChannel(interaction, newEmbed);
                break;
            case (SET_REQUIREMENT_COMMAND_NAME):
                successful = handleSetRequirement(interaction, newEmbed);
            default:
                break;
        }
        
        if (successful) {
            await interaction.reply({embeds: [newEmbed]});
        }
        else {
            await interaction.reply({embeds: [newEmbed], flags: EPHEMERAL_FLAG});
        }
    },
};
