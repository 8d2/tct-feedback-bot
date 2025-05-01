const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption } = require("discord.js");
const USER_OPTION = "user"

module.exports = {
    data: new SlashCommandBuilder()
        .setName("mod")
        .setDescription("Moderator commands")

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("block")
            .setDescription("Blocks a user from creating feedback contracts")
            .addUserOption(new SlashCommandUserOption()
                .setName(USER_OPTION)
                .setDescription("The user to block")
                .setRequired(true)
            )
        )

        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("unblock")
            .setDescription("Unblocks a user, allowing them to create feedback contracts.")
            .addUserOption(new SlashCommandUserOption()
                .setName(USER_OPTION)
                .setDescription("The user to unblock")
                .setRequired(true)
            )
        ),

    async execute(interaction) {
        // check that the user has moderator permissions
        //perms = interactions.member.permissions
        //if (perms.has(

        subcommandName = interaction.options.getSubcommand()
        if (subcommandName === "block") {
            blockeeName = interaction.options.getUser(USER_OPTION).displayName
            await interaction.reply("**" + blockeeName + "** has been blocked from creating feedback contracts.")
        }
        else if (subcommandName === "unblock") {
            unblockeeName = interaction.options.getUser(USER_OPTION).displayName
            await interaction.reply("**" + blockeeName + "** has been unblocked and can now create feedback contracts.")
        }
    },
}
