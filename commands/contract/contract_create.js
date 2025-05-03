const { ButtonBuilder, ButtonStyle, ActionRowBuilder, CommandInteractionOptionResolver } = require("discord.js");
const { createContractEmbed, createStarSelectDropdown } = require("../../handlers/contract");

/**
 * Handles the `/contract create` subcommand.
 * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
 */
async function handleContractCreate(interaction) {

    const embed = createContractEmbed(interaction);
    const starSelect = createStarSelectDropdown();
    
    const confirm = new ButtonBuilder()
        .setCustomId('feedback-contract-confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);
    
    const row1 = new ActionRowBuilder()
        .addComponents(starSelect);
    
    const row2 = new ActionRowBuilder()
        .addComponents(confirm);

    await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
    });
};

module.exports = {
    isSubcommandModule: true,
    handleContractCreate,
}