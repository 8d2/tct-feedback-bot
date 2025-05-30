// Base code taken from discord.js guide
// https://discordjs.guide/creating-your-bot/event-handling.html

const { Events } = require('discord.js');

const userMethods = require("../helpers/userMethods.js")
const settingsMethods = require("../helpers/settingsMethods.js")
const collaboratorMethods = require("../helpers/collaboratorMethods.js")

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        // Will run once when the client is loaded
        userMethods.init();
        settingsMethods.init();
        collaboratorMethods.init();
        console.log(`${client.user.tag} ready.`);
        console.log(client.application.id);
    },
};