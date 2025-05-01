const { ButtonBuilder, ButtonStyle, SlashCommandBuilder, ActionRowBuilder, blockQuote, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, SlashCommandSubcommandBuilder } = require("discord.js");

async function handleCreate(interaction) {
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
    
    const accept = new ButtonBuilder()
        .setCustomId('accept')
        .setLabel('Accept')
        .setStyle(ButtonStyle.Primary);
    
    const row = new ActionRowBuilder()
        .addComponents(starSelect);

    await interaction.reply({
        content: `Sign ${interaction.user}'s contract bro`,
        components: [row],
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
        }
    },
};
