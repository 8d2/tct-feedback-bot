// Stores commands + handles sub commands
const { Collection, EmbedBuilder, MessageFlags } = require("discord.js");
const fileSystem = require('node:fs');
const path = require('node:path');

const constants = require("../helpers/constants.js")

const EPHEMERAL_FLAG = MessageFlags.Ephemeral

const commands = new Collection();

// Grab all the command folders from the commands directory
const foldersPath = path.join(__dirname, '..', 'commands');
const commandFolders = fileSystem.readdirSync(foldersPath);

/**
 * Loads command at the given path.
 * @param {string} filePath Path to command file.
 */
function loadCommand(filePath) {
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
        commands.set(command.data.name, command);
	} 
	else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}
 
/**
 * Loads commands within folder into the commands list.
 * @returns {Collection} Commands collection.
 */
function loadCommands() {
    // Stole from docs... but a bit better!
    for (const subPath of commandFolders) {
        const fullSubPath = path.join(foldersPath, subPath);
        
        if (subPath.endsWith('.js')) {
            // Command file directly in folder
            loadCommand(fullSubPath);
        }
        else {
            // Grab all the command files from the commands directory you created earlier
            const commandFiles = fileSystem.readdirSync(fullSubPath).filter(file => file.endsWith('.js'));
        
            // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
            for (const file of commandFiles) {
                const filePath = path.join(fullSubPath, file);
                loadCommand(filePath);
            }
        }
    }
    return commands;
}

/**
 * Execute running a subcommand from the interaction.
 * @param {CommandInteraction} interaction Command interaction.
 * @param {Map} commands Map from subcommand to function.
 * @param {boolean?} noEmbed If true, a preset embed will not provided to command functions.
 */
async function handleSubcommandExecute(interaction, commands, noEmbed = false) {
    const subcommandName = interaction.options.getSubcommand();
    const command = (subcommandName in commands) ? commands[subcommandName] : null;

    // Subcommand isn't in commands map!
    if (!command) {
        console.log(`[WARNING] The sub command "${subcommandName}" does not have a defined function in commands.`)
    }

    if (noEmbed) {
        // No embed, just run command if it exists
        if (command) {
            command(interaction);
        }
    }
    else {
        // Create embed to reply
        let newEmbed = new EmbedBuilder().setTimestamp().setDescription(constants.COMMAND_NOT_IMPLEMENTED_DESC);
        const result = command ? await command(interaction, newEmbed) : false;
        if (result) {
            await interaction.reply({embeds: [newEmbed]});
            if (typeof(result) == "object") {
                // Result returned as object, see custom options for following up to user
                let followUpOptions = {};
                if ("followUpEmbeds" in result) {
                    followUpOptions.embeds = result.followUpEmbeds;
                }
                if ("doFollowUpPing" in result && result.doFollowUpPing) {
                    followUpOptions.content = `${interaction.user}` + (followUpOptions.content ? "\n" + followUpOptions.content : "");
                }
                if (followUpOptions.content || (followUpOptions.embeds && followUpOptions.embeds.length > 0)) {
                    await interaction.followUp(followUpOptions);
                }
            }
        }
        else {
            await interaction.reply({embeds: [newEmbed], flags: EPHEMERAL_FLAG});
        }
    }
}

module.exports = {
    loadCommand,
    loadCommands,
    handleSubcommandExecute
}