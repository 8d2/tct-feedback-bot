// Base code taken from discord.js guide
// https://discordjs.guide/creating-your-bot/event-handling.html

const { Events, MessageFlags, EmbedBuilder, Colors } = require('discord.js');

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

            // THIS CODE IS TEMPORARY!!!!!!!!!!!!!1 
            const select_menu_id = interaction.customId;
            const select_menu_values = interaction.values; // NOTE: this is an array of active selections
            
            const embed = new EmbedBuilder()
                .setColor(Colors.Green)
                .setTitle("Feedback Agreement")
                .setAuthor({
                    name: interaction.user.username, 
                    iconURL: interaction.user.avatarURL(),
                })
                .setDescription("THIS DESCRIPTION IS EDITED!!!!!!")
                .setTimestamp();

            interaction.message.edit({
                content: `${interaction.values[0]}`,
                embeds: [embed]
            });
            console.log(interaction.message);
		}
	},
};