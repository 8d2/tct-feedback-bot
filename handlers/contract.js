const { ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder, EmbedBuilder, Colors, blockQuote } = require("discord.js");

const { HORIZONTAL_RULE, STAR_RATING_INFO } = require("../helpers/constants.js");
const { getOriginalUser } = require("../helpers/messageMethods.js");

/**
 * Creates a new confirm button.
 * @param {boolean?} disabled Whether the button is disabled. (Default: true)
 * @returns {ButtonBuilder} The created confirm button.
 */
function createConfirmButton(disabled = true) {
    return new ButtonBuilder()
        .setCustomId('feedback-contract-confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success)
        .setDisabled(disabled);
}

/**
 * Creates a new embed corresponding to the selected star rating.
 * @param {String?} starRating The selected star rating as a string.
 * @param {import("discord.js").Interaction} interaction The interaction that used this command.
 * @returns {EmbedBuilder} An embed corresponding to the selected star rating.
 */
function createContractEmbed(interaction, starRating) {

    // Get star rating info from star rating
    const starData = STAR_RATING_INFO[starRating];

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
    const originalAuthor = {
        name: originalUser.username, 
        iconURL: originalUser.avatarURL(),
    };

    // Build the embed
    const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("Feedback Agreement")
        .setAuthor(originalAuthor)
        .setDescription(
            `${originalUser} has completed their feedback! Please use the dropdown menu to rate their feedback's quality, and click "Confirm" to submit.
            ${fullDescription ? `${HORIZONTAL_RULE}# ` + starRatingLabel + "\n" + blockQuote(fullDescription) : ""}`)
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
        .setCustomId('feedback-contract-star-select')
        .setPlaceholder(STAR_RATING_INFO[selected] ? STAR_RATING_INFO[selected].menu_label : "Select one...")
        .addOptions(
            // Create a menu option for each star rating
            Object.values(STAR_RATING_INFO).map(rating => 
                new StringSelectMenuOptionBuilder()
                    .setLabel(rating.menu_label)
                    .setDescription(rating.menu_description)
                    .setValue(rating.menu_value)
            )
        );
}

/**
 * The function name of all time. Yes, it probably needs to be that way...
 * 
 * Handles feedback contract star select interactions.
 * @param {import("discord.js").Interaction} interaction The interaction that used this string select menu.
 */
async function handleContractStarSelectInteraction(interaction) {

    // Updates the feedback contract message
    await interaction.update(createContractMessage(interaction));
}

module.exports = {
    createContractMessage,
    handleContractStarSelectInteraction,
}