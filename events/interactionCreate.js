// Base code taken from discord.js guide
// https://discordjs.guide/creating-your-bot/event-handling.html

const { Events, MessageFlags } = require('discord.js');

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
        else if (interaction.isButton()) {
			// Respond to buttons
		} 
        else if (interaction.isStringSelectMenu()) {
			// Respond to select menus
            console.log(interaction.customId);
            console.log(interaction.values);
            console.log(interaction.user.id);
            console.log(interaction.client);
		}
	},
};