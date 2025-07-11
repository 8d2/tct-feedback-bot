// Base code taken from discord.js guide
// https://discordjs.guide/creating-your-bot/event-handling.html

const { Events, MessageFlags } = require('discord.js');
const { handleContractStarSelectInteraction, handleContractConfirmInteraction, handleContractRulesAcceptInteraction } = require('../handlers/contract');
const constants = require("../helpers/constants.js");

const BUTTON_HANDLERS = {
    [constants.CONTRACT_CONFIRM_CUSTOM_ID]: handleContractConfirmInteraction,
    [constants.CONTRACT_RULES_ACCEPT_ID]: handleContractRulesAcceptInteraction,
};
const STRING_SELECT_HANDLERS = {
    [constants.CONTRACT_STAR_SELECT_CUSTOM_ID]: handleContractStarSelectInteraction
};

/**
 * Handles a interaction with handlers mapped to different custom IDs.
 * @param {import("discord.js").Interaction} interaction The interaction to handle.
 * @param {Map} handlers Map from custom ID to function handler. Each handler takes in an interaction.
 */
async function handleInteractionByCustomId(interaction, handlers) {
    const customId = interaction.customId;

    // Respond to the interaction using the handler for this customId
    const handler = handlers[customId];
    if (handler) {
        try {
            // Run handler
            await handler(interaction);
        }
        catch (error) {
            // An error occured with finding or running the handler.
            console.log(`[WARNING] Error occurred with running handler for custom id "${customId}":`);
            console.error(error);
        }
    }
    else {
        // The handler for this custom ID does not exist.
        console.log(`[WARNING] No handler exists for the interaction with custom ID "${customId}".`);
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
            handleInteractionByCustomId(interaction, BUTTON_HANDLERS);
		}

        else if (interaction.isStringSelectMenu()) {
            // Respond to select menus
            handleInteractionByCustomId(interaction, STRING_SELECT_HANDLERS);
        }
    },
};