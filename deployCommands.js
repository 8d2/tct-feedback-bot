const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json')
const { loadCommands } = require('./handlers/commands.js')

// Outsourced!
const commandJSONs = loadCommands().map(command => command.data.toJSON());

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commandJSONs.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commandJSONs },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();