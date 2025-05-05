const { SlashCommandBuilder, SlashCommandSubcommandBuilder, EmbedBuilder, Colors, MessageFlags } = require("discord.js");
const { createContractMessage } = require("../../handlers/contract");

const userMethods = require("../../helpers/userMethods.js")

/**
 * Handles the `/contract create` subcommand.
 * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
 */
async function handleContractCreate(interaction) {
    
    // check the user is blocked... this function is empty no longer
    if (userMethods.getIsBlocked(interaction.user.id)) {
        let responseEmbed = new EmbedBuilder()
            .setTimestamp()
            .setColor(Colors.Red)
            .setDescription("You have been blocked from creating feedback contracts for spam or abuse.");
        
        await interaction.reply({embeds: [responseEmbed], flags: MessageFlags.Ephemeral});
    }
    else {
        // Component creation has been outsourced to handlers </3
        await interaction.reply(createContractMessage(interaction));
    }

};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("contract")
        .setDescription("Feedback contract commands")
        
        .addSubcommand(new SlashCommandSubcommandBuilder()
            .setName("create")
            .setDescription("Creates a feedback contract")
        ),

    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case ("create"):
                handleContractCreate(interaction);
                break;
            default:
                return;
        }
    },
};
