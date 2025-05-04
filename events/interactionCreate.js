// Base code taken from discord.js guide
// https://discordjs.guide/creating-your-bot/event-handling.html

const { Events, MessageFlags } = require('discord.js');
const { handleContractStarSelectInteraction } = require('../handlers/contract');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            // Respond to chat commands
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                }
            }
        } 

        // We will need this in the future
        /*
        else if (interaction.isButton()) {
			// Respond to buttons
		}
        */

        else if (interaction.isStringSelectMenu()) {
            // Respond to select menus

            const select_menu_id = interaction.customId;
            try {
                // Respond to the interaction based on the select menu's customId
                switch (select_menu_id) {
                    case ('feedback-contract-star-select'):
                        await handleContractStarSelectInteraction(interaction);
                        break;
                    default:
                        // If you've reached this line, that means the string select menu's customId
                        // is not included in this switch statement.
                        // We may need to refactor this in the future to keep things centralized...
                        console.error(`Select menu ${select_menu_id} is not registered.`);
                        break;
                }
            } 
            catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while updating this string select!', flags: MessageFlags.Ephemeral });
                } 
                else {
                    await interaction.reply({ content: 'There was an error while updating this string select!', flags: MessageFlags.Ephemeral });
                }
            }
        }
    },
};