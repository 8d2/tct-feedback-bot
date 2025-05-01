const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption, PermissionsBitField, EmbedBuilder, Colors, MessageFlags } = require("discord.js");

const USER_OPTION_NAME = "user"
const MOD_PERMS = [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.BanMembers] // 8 (admin) or 4 (ban members)

const BLOCK_COMMAND_NAME = "block"
const UNBLOCK_COMMAND_NAME = "unblock"

// Handles the '/mod block' command.
// interaction: the interaction that used this command
// messageEmbed: the embed to modify and reply with
// returns false if the action failed.
async function handleBlock(interaction, messageEmbed) {
    let blockee = interaction.options.getUser(USER_OPTION_NAME)
    
    // TODO: check if the blockee is already blocked, if so then notify the command user.
    
    messageEmbed.setDescription(`${blockee} has been blocked from creating feedback contracts.`)
    messageEmbed.setColor(Colors.Red)
    return true
}

// Handles the '/mod unblock' command.
// interaction: the interaction that used this command
// messageEmbed: the embed to modify and reply with
// returns false if the action failed.
async function handleUnblock(interaction, messageEmbed) {
    let unblockee = interaction.options.getUser(USER_OPTION_NAME)
    
    // TODO: check if the unblockee is not blocked, if so then notify the command user.
    
    messageEmbed.setDescription(`${unblockee} has been unblocked and can now create feedback contracts.`)
    messageEmbed.setColor(Colors.Green)
    return true
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mod")
        .setDescription("Moderator commands")
        
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
        ),

    async execute(interaction) {
        // check that the user has moderator permissions
        if (!interaction.member.permissions.any(MOD_PERMS)) return

        let newEmbed = new EmbedBuilder().setTimestamp()
        let successful = false

        // action based on subcommand
        switch (interaction.options.getSubcommand()) {
            case (BLOCK_COMMAND_NAME):
                successful = handleBlock(interaction, newEmbed)
                break
            case (UNBLOCK_COMMAND_NAME):
                successful = handleUnblock(interaction, newEmbed)
                break
            default:
                break
        }
        
        if (successful) {
            await interaction.reply({embeds: [newEmbed]})
        }
        else {
            await interaction.reply({embeds: [newEmbed], flags: MessageFlags.Ephemeral})
        }
    },
}
