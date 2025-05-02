const { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption } = require("discord.js");

const userMethods = require("../../helpers/userMethods.js")

const USER_OPTION_NAME = "user";

module.exports = {
    data: new SlashCommandBuilder()
        .setName("getinfo")
        .setDescription("Get info about a user.")
        .addUserOption(new SlashCommandUserOption()
            .setName(USER_OPTION_NAME)
            .setDescription("The user to get info about.")
            .setRequired(true)
        ),
    async execute(interaction) {
        let user = interaction.options.getUser(USER_OPTION_NAME);
        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setAuthor({
                name: user.username, 
                iconURL: user.avatarURL(),
            })
            .setDescription(`Feedback Points: ${userMethods.getPoints(user.id)}\n`);
    
        await interaction.reply({
            embeds: [embed],
        });
    },
}
