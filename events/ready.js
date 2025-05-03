// Base code taken from discord.js guide
// https://discordjs.guide/creating-your-bot/event-handling.html#individual-event-files

const { Events } = require('discord.js');

const userMethods = require("../helpers/userMethods.js")

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
        // Will run once when the client is loaded
		userMethods.update();
        console.log(`${client.user.tag} ready.`);
        console.log(client.application.id);
	},
};