// Base code taken from discord.js guide
// https://discordjs.guide/creating-your-bot/event-handling.html

const { Events, MessageFlags } = require('discord.js');
const { handleContractStarSelectInteraction, handleContractConfirmInteraction } = require('../handlers/contract');
const constants = require("../helpers/constants.js");

const BUTTON_HANDLERS = {
    [constants.CONTRACT_CONFIRM_CUSTOM_ID]: handleContractConfirmInteraction
}
const STRING_SELECT_HANDLERS = {
    [constants.CONTRACT_STAR_SELECT_CUSTOM_ID]: handleContractStarSelectInteraction
}

/**
 * Handles a interaction with handlers mapped to different custom IDs.
 * @param {import("discord.js").Interaction} interaction The interaction to handle.
 * @param {Map} handlers Map from custom ID to function handler. Each handler takes in an interaction.
 */
async function handleInteractionByCustomId(interaction, handlers) {
    const customId = interaction.customId;
    try {
        // Respond to the interaction using the handler for this customId

        const handler = (customId in handlers) ? handlers[customId] : null;
        if (!handler) {
            // The handler for this custom ID does not exist.
            console.error(`[WARNING] No handler exists for the interaction with custom ID "${customId}".`);
        }

        // Run handler
        await handler(interaction);
    } 
    catch (error) {
        // An error occured with finding or running the handler.
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: constants.INTERACTION_FAILED_ERROR, flags: MessageFlags.Ephemeral });
        } 
        else {
            await interaction.reply({ content: constants.INTERACTION_FAILED_ERROR, flags: MessageFlags.Ephemeral });
        }
    }
}

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
            } 
            catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                } 
                else {
                    await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
                }
            }
        } 

        else if (interaction.isButton()) {
			// Respond to buttons
            handleInteractionByCustomId(interaction, BUTTON_HANDLERS)
		}

        else if (interaction.isStringSelectMenu()) {
            // Respond to select menus
            handleInteractionByCustomId(interaction, STRING_SELECT_HANDLERS)
        }
    },
};