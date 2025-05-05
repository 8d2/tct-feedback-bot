// Discord.js classes
const fileSystem = require("node:fs");
const path = require("node:path");
const {Client, Collection, Events, GatewayIntentBits} = require("discord.js");

// Get global variables
const {token} = require("./config.json");

// Create client
const client = new Client({intents: GatewayIntentBits.Guilds});
client.commands = new Collection();

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

const settingsMethods = require("./helpers/settingsMethods.js")

// I also stole this from the docs lol
// Retrieves all event files and loads them individually
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fileSystem.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } 
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Starts the bot
client.login(token);