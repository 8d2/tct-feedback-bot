const { CommandInteractionOptionResolver } = require("discord.js");
const { createContractMessage } = require("../../handlers/contract");

/**
 * Handles the `/contract create` subcommand.
 * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
 */
async function handleContractCreate(interaction) {

    // Component creation has been outsourced to handlers </3
    await interaction.reply(createContractMessage(interaction));

};

module.exports = {
    isSubcommandModule: true,
    handleContractCreate,
}