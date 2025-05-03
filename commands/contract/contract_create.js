const { ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, Colors, bold, CommandInteractionOptionResolver, strikethrough, blockQuote, underline, subtext } = require("discord.js");

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
            • The user provided some basic constructive remarks about the tower, but did not share any examples.
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
 * Creates a new embed corresponding to the selected star rating.
 * @param {String?} star_rating The selected star rating as a string.
 * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
 * @returns {EmbedBuilder} An embed corresponding to the selected star rating.
 */
function createEmbed(interaction, star_rating) {

    // Get star rating info from star rating
    const star_data = STAR_RATING_INFO[star_rating];

    // Assign description and star rating label
    let full_description = null;
    let star_rating_label = "";
    if (star_rating) {
        full_description = star_data.full_description;
        point_value = star_data.point_value
        star_rating_label = `${star_data.menu_label} ${point_value} STAR${point_value === 1 ? '' : 'S'}`;
    }

    // Build the embed
    const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("Feedback Agreement")
        .setAuthor({
            name: interaction.user.username, 
            iconURL: interaction.user.avatarURL(),
        })
        .setDescription(
            `${interaction.user} has completed their feedback! Please use the dropdown menu to rate their feedback's quality, and click "Confirm" to submit.
            ${full_description ? `${HORIZONTAL_RULE}# ` + star_rating_label + "\n" + blockQuote(full_description) : ""}`)
        .setTimestamp();
    
    return embed;
}

/**
 * Handles the `/contract create` subcommand.
 * @param {CommandInteractionOptionResolver} interaction The interaction that used this command.
 */
async function handleContractCreate(interaction) {

    const embed = createEmbed(interaction);

    const starSelect = new StringSelectMenuBuilder()
        .setCustomId('feedback-contract-star-select')
        .setPlaceholder("Select one")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(STAR_RATING_INFO["stars-0"].menu_label)
                .setDescription(STAR_RATING_INFO["stars-0"].menu_description)
                .setValue(STAR_RATING_INFO["stars-0"].menu_value),
            new StringSelectMenuOptionBuilder()
                .setLabel(STAR_RATING_INFO["stars-1"].menu_label)
                .setDescription(STAR_RATING_INFO["stars-1"].menu_description)
                .setValue(STAR_RATING_INFO["stars-1"].menu_value),
            new StringSelectMenuOptionBuilder()
                .setLabel(STAR_RATING_INFO["stars-2"].menu_label)
                .setDescription(STAR_RATING_INFO["stars-2"].menu_description)
                .setValue(STAR_RATING_INFO["stars-2"].menu_value),
            new StringSelectMenuOptionBuilder()
                .setLabel(STAR_RATING_INFO["stars-3"].menu_label)
                .setDescription(STAR_RATING_INFO["stars-3"].menu_description)
                .setValue(STAR_RATING_INFO["stars-3"].menu_value)
        );
    
    const confirm = new ButtonBuilder()
        .setCustomId('feedback-contract-confirm')
        .setLabel('Confirm')
        .setStyle(ButtonStyle.Success)
        .setDisabled(true);
    
    const row1 = new ActionRowBuilder()
        .addComponents(starSelect);
    
    const row2 = new ActionRowBuilder()
        .addComponents(confirm);

    await interaction.reply({
        embeds: [embed],
        components: [row1, row2],
    });
};

module.exports = {
    isSubcommandModule: true,
    handleContractCreate,
}