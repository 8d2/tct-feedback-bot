const { ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, Colors, bold, strikethrough, blockQuote, underline, subtext } = require("discord.js");

const HORIZONTAL_RULE = `\n${subtext(strikethrough("-------------------------------"))}\n`;
const STAR_RATING_INFO = {
    ["stars-0"]: {
        menu_value: "stars-0",
        menu_label: "💣",
        menu_description: "Minimal to no feedback",
        full_description:
            `${bold("The user provided feedback with no clear effort or intent to help, or they just posted this agreement without sending any feedback whatsoever, for some reason.")}

            ${bold(underline("EXAMPLES"))}
            • The user simply remarked "cool tower" or "this tower sucks!", and did not provide any constructive feedback beyond that.
            • The user did not actually provide any feedback.
            • ${bold("DO NOT")} assign this rating if you simply disagree with the feedback.`,
        point_value: 0,
    },
    ["stars-1"]: {
        menu_value: "stars-1",
        menu_label: "⭐",
        menu_description: "Partial or subpar feedback",
        full_description:
            `${bold("The user provided partial feedback, or subpar feedback with demonstrable effort.")}

            ${bold(underline("EXAMPLES"))}
            • The user posted a few helpful screenshots showing the first few floors, but stopped sharing feedback in the middle of the tower.
            • The user provided some helpful, constructive remarks about the tower, but did not share any examples.
            • The user attempted to provide full feedback on the tower, but because it was far outside their difficulty range, they could not provide much help.
            • ${bold("DO NOT")} assign this rating if you simply disagree with the feedback.`,
        point_value: 1,
    },
    ["stars-2"]: {
        menu_value: "stars-2",
        menu_label: "⭐⭐",
        menu_description: "Complete feedback",
        full_description:
            `${bold("The user provided sufficient feedback.")}

            ${bold(underline("EXAMPLES"))}
            • The user completed a full noclip run of the tower, sending screenshots along the way.
            • The user sent only a handful of screenshots, but made up for it by providing some helpful insights.
            • ${bold("DO NOT")} assign this rating if your tower is less than 30% complete.`,
        point_value: 2,
    },
    ["stars-3"]: {
        menu_value: "stars-3",
        menu_label: "⭐⭐⭐",
        menu_description: "Excellent feedback",
        full_description:
            `${bold("The user provided thoughtful, thorough, and/or insightful feedback; they went the extra mile, and they deserve a bonus star for their efforts.")}

            ${bold(underline("EXAMPLES"))}
            • The user attempted or completed a legit playthrough of the tower, providing numerous screenshots and insights from their experience.
            • The user provided extensive, nuanced insights, approaching the standards of a typical curator review.
            • The user provided additional assistance with your tower on top of usual feedback, perhaps by sending models to fix particularly tricky bugs, or by volunteering to join a team create to fix issues without the intent of collaborating.
            • The user provided thorough feedback worthy of at least two stars, but your tower is very, very long, and the extra time spent is worthy of a third star.
            • ${bold("DO NOT")} assign this rating if your tower is less than 60% complete.`,
        point_value: 3,
    },
};

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

    // Get the user (as an author) who sent the contract originally
    // This may seem weird, but I swear it's like this for a reason
    const contractSenderAuthor = {
        name: interaction.user.username, 
        iconURL: interaction.user.avatarURL(),
    };
    let contractSenderUserId = interaction.user.id;
    if (interaction.message) {
        // Drill, baby, drill!
        const embedData = interaction.message.embeds[0].data;
        const authorData = embedData.author;
        contractSenderAuthor.name = authorData.name;
        contractSenderAuthor.iconURL = authorData.icon_url;

        // Extract the contract sender's user ID from the description in the embed (THIS IS SO BAD)
        const embedDescription = embedData.description;
        // ^^^^^^ Example of the string we're dissecting: 
        // '<@699811922283629313> has completed their feedback! Please use the dropdown menu to rate their feedback's quality, and click "Confirm" to submit.'
        const idxA = embedDescription.indexOf('@');
        const idxB = embedDescription.indexOf('>');
        contractSenderUserId = embedDescription.slice(idxA + 1, idxB);
    }

    // Build the embed
    const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("Feedback Agreement")
        .setAuthor(contractSenderAuthor)
        .setDescription(
            `<@${contractSenderUserId}> has completed their feedback! Please use the dropdown menu to rate their feedback's quality, and click "Confirm" to submit.
            ${fullDescription ? `${HORIZONTAL_RULE}# ` + starRatingLabel + "\n" + blockQuote(fullDescription) : ""}`)
        .setTimestamp();
    // Save original author to embed's data so it can be reused later
    embed.original_author = contractSenderAuthor;
    
    return embed;
}

/**
 * Constructs a complete contract message, including an embed, rating select, and confirm button.
 * @param {import("discord.js").Interaction} interaction The interaction that created/used the contract.
 * @param {string?} pingId ID of the user to ping within the contract message.
 * @returns {import("discord.js").InteractionReplyOptions} The created contract message.
 */
function createContractMessage(interaction, pingId) {

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
    const threadOwnerPing = pingId ? `<@${pingId}>` : null;
    // Preserves the thread owner ping between message updates
    const previousContent = interaction.message ? interaction.message.content : null;

    return {
        content: threadOwnerPing || previousContent,
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