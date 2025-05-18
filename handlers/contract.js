const { ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, EmbedBuilder, Colors, blockQuote } = require("discord.js");

const constants = require("../helpers/constants.js");
const { getOriginalUser, getAuthorOptions, getGainedRolesMessage } = require("../helpers/messageMethods.js");
const collaboratorMethods = require("../helpers/collaboratorMethods.js");
const { showCommandError } = require("../helpers/messageMethods.js");
const contractMethods = require("../helpers/contractMethods.js");
const userMethods = require("../helpers/userMethods.js");
const { pluralize } = require('../helpers/util.js');

/**
 * Creates a new embed corresponding to the selected star rating.
 * @param {String?} starRating The selected star rating as a string.
 * @param {import("discord.js").Interaction} interaction The interaction that used this command.
 * @returns {EmbedBuilder} An embed corresponding to the selected star rating.
 */
function createContractEmbed(interaction, starRating) {

    // Get star rating info from star rating
    const starData = constants.STAR_RATING_INFO[starRating];

    // Assign description and star rating label
    let fullDescription = null;
    let starRatingLabel = "";
    if (starRating) {
        fullDescription = starData.full_description;
        pointValue = starData.point_value
        starRatingLabel = `${starData.menu_label} ${pointValue} STAR${pointValue === 1 ? '' : 'S'}`;
    }

    // No more drilling! Just get the original creator to use.
    const originalUser = getOriginalUser(interaction);

    // Build the embed
    const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle(constants.FEEDBACK_AGREEMENT_TITLE)
        .setAuthor(getAuthorOptions(originalUser))
        .setDescription(
            `${originalUser} has completed their feedback! Please use the dropdown menu to rate their feedback's quality, and click "Confirm" to submit.
            ${fullDescription ? `${constants.HORIZONTAL_RULE}# ` + starRatingLabel + "\n" + blockQuote(fullDescription) : ""}`)
        .setTimestamp();
    return embed;
}

/**
 * Constructs a complete contract message, including an embed, rating select, and confirm button.
 * @param {import("discord.js").Interaction} interaction The interaction that created/used the contract.
 * @param {[User]?} pingUsers Users to ping within the contract message.
 * @returns {import("discord.js").InteractionReplyOptions} The created contract message.
 */
function createContractMessage(interaction, pingUsers) {

    // If no star rating is selected, this is just null
    const selectedStarRating = interaction.values ? interaction.values[0] : null;
    const newContractEmbed = createContractEmbed(interaction, selectedStarRating);

    // Yes, we have to make a new one.
    // If only I could just directly edit the button's disabled property...
    const newStarSelect = createStarSelectDropdown(selectedStarRating);
    // Enables the button if a star rating is selected
    const newConfirmButton = createConfirmButton(selectedStarRating === null);

    const row1 = new ActionRowBuilder()
        .addComponents(newStarSelect);
    
    const row2 = new ActionRowBuilder()
        .addComponents(newConfirmButton);
    
    // Adds a thread owner ping to the message
    let threadOwnerPing;
    if (pingUsers) {
        // Should use in future to ping all collaborators
        threadOwnerPing = "";
        pingUsers.forEach((user, index) => {
            threadOwnerPing += `${user}`;
            if (index != (pingUsers.length - 1)) {
                threadOwnerPing += "\n";
            }
        });
    }
    // Preserves the thread owner ping between message updates
    const previousContent = interaction.message ? interaction.message.content : null;

    return {
        content: threadOwnerPing ? (threadOwnerPing || previousContent) : previousContent,
        embeds: [newContractEmbed],
        components: [row1, row2],
    };
}

/**
 * Creates a new feedback contract star select dropdown menu.
 * @param {string?} selected The currently selected star rating.
 * @returns {StringSelectMenuBuilder} The created star select dropdown menu.
 */
function createStarSelectDropdown(selected) {
    return new StringSelectMenuBuilder()
        .setCustomId(constants.CONTRACT_STAR_SELECT_CUSTOM_ID)
        .setPlaceholder(constants.STAR_RATING_INFO[selected] ? constants.STAR_RATING_INFO[selected].menu_label : "Select one...")
        .addOptions(
            // Create a menu option for each star rating
            Object.values(constants.STAR_RATING_INFO).map(rating => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(rating.menu_label)
                    .setDescription(rating.menu_description)
                    .setValue(rating.menu_value)
            )
        );
}

/**
 * Creates a new confirm button.
 * @param {boolean?} disabled Whether the button is disabled. (Default: true)
 * @returns {ButtonBuilder} The created confirm button.
 */
function createConfirmButton(disabled = true) {
    return new ButtonBuilder()
        .setCustomId(constants.CONTRACT_CONFIRM_CUSTOM_ID)
        .setLabel("Confirm")
        .setStyle(ButtonStyle.Success)
        .setDisabled(disabled);
}

/**
 * Get whether the interaction with the feedback contract is allowed. Replies to the interaction with an error if not allowed.
 * @param {import("discord.js").Interaction} interaction The interaction trying to do something with a contract.
 * @returns {boolean} Whether the interaction was allowed to interact or not.
 */
async function detectContractInteractionAllowed(interaction) {

    // Only collaborators can interact with contracts!
    // If the user is not a collaborator, display an error message.
    const user = interaction.user;
    const thread = interaction.channel;
    if (!(await collaboratorMethods.getUserIsCollaborator(user, thread))) {
        await showCommandError(interaction, constants.INTERACTION_NOT_BUILDER_ERROR);
        return false;
    }

    // Allowed!
    return true;
}

/**
 * Handles feedback contract star select interactions.
 * @param {import("discord.js").Interaction} interaction The interaction that used this string select menu.
 */
async function handleContractStarSelectInteraction(interaction) {
    // Updates the feedback contract message if interaction allowed
    if (await detectContractInteractionAllowed(interaction)) {
        await interaction.update(createContractMessage(interaction));
    }
}

/**
 * Handles feedback contract confirm button interaction.
 * @param {import("discord.js").Interaction} interaction The interaction that used the confirm button.
 */
async function handleContractConfirmInteraction(interaction) {
    // Confirms the contract if interaction allowed
    if (await detectContractInteractionAllowed(interaction)) {
        // Get the star select menu's value to determine awarding points
        const message = interaction.message;
        const starRatingLabel = message.components[0].components[0].placeholder;
        const awardPoints = contractMethods.parseRatingLabelToPoints(starRatingLabel);

        // Get original user's points and add awarding points
        const originalUser = getOriginalUser(interaction);
        const originalPoints = await userMethods.getPoints(originalUser.id);
        const newPoints = originalPoints + awardPoints;
        if (newPoints != originalPoints) {
            // New point amount, set and update user
            userMethods.setPoints(originalUser.id, newPoints);
            userMethods.updateRoles(interaction, originalUser.id);
        }

        // Edit original contract message
        const lockedResponseEmbed = new EmbedBuilder()
            .setTitle(constants.FEEDBACK_AGREEMENT_TITLE)
            .setColor(Colors.Blue)
            .setAuthor(getAuthorOptions(originalUser))
            .setDescription(
                `This feedback contract has been accepted and rated ${starRatingLabel} by ${interaction.user}.\n` +
                `${originalUser} has earned ${pluralize(awardPoints, "feedback point")}` +
                (awardPoints != 0 ? ` and they now have ${pluralize(newPoints, "point")}` : "") + "."
            )
            .setTimestamp();
        await interaction.update({content: message.content, embeds: [lockedResponseEmbed], components: []});

        // Follow up with a ping to original user if they have pings enabled
        if (await userMethods.getAllowPings(originalUser.id)) {
            const gainedRolesMessage = await getGainedRolesMessage(interaction, originalPoints, newPoints);
            const followUpMessage =
                `${originalUser} Your feedback contract has been accepted.` +
                (gainedRolesMessage ? ` You have earned new roles: ${gainedRolesMessage}` : "");
            await interaction.followUp({content: followUpMessage});
        }
    }
}

module.exports = {
    createContractMessage,
    handleContractStarSelectInteraction,
    handleContractConfirmInteraction
}