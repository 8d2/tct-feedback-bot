const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption, PermissionsBitField, EmbedBuilder, Colors, MessageFlags } = require("discord.js");

const USER_OPTION_NAME = "user"
const MOD_PERMS = [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.BanMembers] // 8 (admin) or 4 (ban members)

const BLOCK_COMMAND_NAME = "block"
const UNBLOCK_COMMAND_NAME = "unblock"

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

        // action based on subcommand
        switch (interaction.options.getSubcommand()) {
            case (BLOCK_COMMAND_NAME):
                let blockee = interaction.options.getUser(USER_OPTION_NAME)
                newEmbed.setDescription(`${blockee} has been blocked from creating feedback contracts.`)
                newEmbed.setColor(Colors.Red)
                break
            case (UNBLOCK_COMMAND_NAME):
                let unblockee = interaction.options.getUser(USER_OPTION_NAME)
                newEmbed.setDescription(`${unblockee} has been unblocked and can now create feedback contracts.`)
                newEmbed.setColor(Colors.Green)
                break
            default:
                break
        }

        await interaction.reply({embeds: [newEmbed]})
    },
}
