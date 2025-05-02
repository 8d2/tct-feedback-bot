// Discord.js classes
const fileSystem = require("node:fs")
const path = require("node:path")
const {Client, Collection, Events, GatewayIntentBits} = require("discord.js")

// Get global variables
const {token} = require("./config.json")
const userMethods = require("./userMethods.js")

// Create client
const client = new Client({intents: GatewayIntentBits.Guilds})
client.commands = new Collection()

// I stole this from the docs lol
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fileSystem.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fileSystem.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('isSubcommandModule' in command) {
			// Silences the warning if 'data' or 'execute' is not found (see the final else statement)
			// These modules are handled within another folder, so they should be ignored here
			continue;
		}
		else if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} 
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Will run once when the client is loaded
client.once(Events.ClientReady, readyClient => {
	userMethods.sync()
    console.log(`${readyClient.user.tag} ready.`)
    console.log(readyClient.application.id)
})

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (command) {
        await command.execute(interaction)
    }
})

// Starts the bot
client.login(token)