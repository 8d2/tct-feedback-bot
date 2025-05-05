// Discord.js classes
const fileSystem = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");

const { loadCommands } = require('./handlers/commands.js');
const settingsMethods = require("./helpers/settingsMethods.js");

// Get global variables
const { token } = require("./config.json");

// Create client
const client = new Client({intents: GatewayIntentBits.Guilds});
client.commands = loadCommands();

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