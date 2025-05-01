const { ButtonBuilder, ButtonStyle, SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, Colors, italic } = require("discord.js");

async function handleCreate(interaction) {

    const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("Feedback Agreement")
        .setAuthor({
            name: interaction.user.username, 
            iconURL: interaction.user.avatarURL(),
        })
        .setDescription(`${interaction.user} has completed their feedback! Please use the dropdown menu to rate their feedback's quality, and click "Confirm" to submit.`)
        .setTimestamp();

    const starSelect = new StringSelectMenuBuilder()
        .setCustomId('star-select')
        .setPlaceholder("Select one")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel("💣")
                .setDescription("Provided minimal to no feedback")
                .setValue('stars-0'),
            new StringSelectMenuOptionBuilder()
                .setLabel("⭐")
                .setDescription("Provided partial feedback, or subpar feedback with demonstrable effort")
                .setValue('stars-1'),
            new StringSelectMenuOptionBuilder()
                .setLabel("⭐⭐")
                .setDescription("Provided complete feedback")
                .setValue('stars-2'),
            new StringSelectMenuOptionBuilder()
                .setLabel("⭐⭐⭐")
                .setDescription("Provided thoughtful, thorough, insightful feedback; went the extra mile")
                .setValue('stars-3')
        );
    
    const confirm = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success);
    
    const row1 = new ActionRowBuilder()
        .addComponents(starSelect);
    
    const row2 = new ActionRowBuilder()
        .addComponents(confirm);

    await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("contract")
        .setDescription("Feedback contract commands")
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("create")
            .setDescription("Creates a feedback contract")
        ),

    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case ("create"):
                handleCreate(interaction);
            default:
                return;
        }
    },
};
