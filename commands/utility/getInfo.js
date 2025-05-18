const { Colors, EmbedBuilder, SlashCommandBuilder, SlashCommandUserOption, bold } = require("discord.js");

const userMethods = require("../../helpers/userMethods.js")
const { getAuthorOptions } = require("../../helpers/messageMethods.js")

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
            .setAuthor(getAuthorOptions(user))
            .setDescription(
                `Feedback Points: ${await userMethods.getPoints(user.id)}\n` +
                `Allow Pings: ${bold(await userMethods.getAllowPings(user.id))}`
            );
    
        await interaction.reply({
            embeds: [embed],
        });
    },
}
