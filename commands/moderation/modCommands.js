const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption, SlashCommandIntegerOption, 
    PermissionFlagsBits, EmbedBuilder, Colors, MessageFlags }
    = require("discord.js");

const userMethods = require("../../helpers/userMethods.js")

// Constants
const USER_OPTION_NAME = "user";
const POINTS_OPTION_NAME = "points";

const BLOCK_COMMAND_NAME = "block";
const SET_POINTS_COMMAND_NAME = "setpoints";
const UNBLOCK_COMMAND_NAME = "unblock";

const EPHEMERAL_FLAG = MessageFlags.Ephemeral;

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
