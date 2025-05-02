const { ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder, Colors, bold } = require("discord.js");

const STAR_RATING_INFO = {
    stars_0: {
        menu_value: "stars-0",
        menu_label: "💣",
        menu_description: "Minimal to no feedback",
        full_description:
            `The user provided feedback with no clear effort or intent to help, or they just posted this agreement without sending any feedback whatsoever, for some reason.

            Examples:
            • The user simply remarked "cool tower" or "this tower sucks!", and did not provide any constructive feedback beyond that.
            • The user did not actually provide any feedback.
            • ${bold("DO NOT")} assign this rating if you simply disagree with the feedback.`,
    },
    stars_1: {
        menu_value: "stars-1",
        menu_label: "⭐",
        menu_description: "Partial or subpar feedback",
        full_description:
            `The user provided partial feedback, or subpar feedback with demonstrable effort.

            Examples:
            • The user posted a few helpful screenshots showing the first few floors, but stopped sharing feedback in the middle of the tower.
            • The user provided some basic constructive remarks about the tower, but did not share any examples.
            • The user attempted to provide full feedback on the tower, but because it was far outside their difficulty range, they could not provide much help.
            • ${bold("DO NOT")} assign this rating if you simply disagree with the feedback.`,
    },
    stars_2: {
        menu_value: "stars-2",
        menu_label: "⭐⭐",
        menu_description: "Complete feedback",
        full_description:
            `The user provided sufficient feedback.

            Examples:
            • The user completed a full noclip run of the tower, sending screenshots along the way.
            • The user sent only a handful of screenshots, but made up for it by providing some helpful insights.
            • ${bold("DO NOT")} assign this rating if your tower is less than 20% complete.`,
    },
    stars_3: {
        menu_value: "stars-3",
        menu_label: "⭐⭐⭐",
        menu_description: "Excellent feedback",
        full_description:
            `The user provided thoughtful, thorough, and/or insightful feedback; they went the extra mile, and they deserve a bonus star for their efforts.

            Examples:
            • The user attempted or completed a legit playthrough of the tower, providing numerous screenshots and insights from their experience.
            • The user provided extensive, nuanced insights, approaching the standards of a typical curator review.
            • The user provided additional assistance with your tower on top of usual feedback, perhaps by sending models to fix particularly tricky bugs, or by volunteering to join a team create to fix issues without the intent of collaborating.
            • ${bold("DO NOT")} assign this rating if your tower is less than 50% complete.`,
    },
}

// Creates a new embed corresponding to the selected star rating.
function createEmbed(star_rating) {
    //WIP
    switch(star_rating) {
        default: return;
    }
}

// Handles the `/contract create` subcommand
async function handleContractCreate(interaction) {

    const embed = new EmbedBuilder()
        .setColor(Colors.Green)
        .setTitle("Feedback Agreement")
        .setAuthor({
            name: interaction.user.username, 
            iconURL: interaction.user.avatarURL(),
        })
        .setDescription(`${interaction.user} has completed their feedback! Please use the dropdown menu to rate their feedback's quality, and click "Confirm" to submit.`)
        .setTimestamp();

    const starSelect = new StringSelectMenuBuilder()
        .setCustomId('star-select')
        .setPlaceholder("Select one")
        .addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(STAR_RATING_INFO.stars_0.menu_label)
                .setDescription(STAR_RATING_INFO.stars_0.menu_description)
                .setValue(STAR_RATING_INFO.stars_0.menu_value),
            new StringSelectMenuOptionBuilder()
                .setLabel(STAR_RATING_INFO.stars_1.menu_label)
                .setDescription(STAR_RATING_INFO.stars_1.menu_description)
                .setValue(STAR_RATING_INFO.stars_1.menu_value),
            new StringSelectMenuOptionBuilder()
                .setLabel(STAR_RATING_INFO.stars_2.menu_label)
                .setDescription(STAR_RATING_INFO.stars_2.menu_description)
                .setValue(STAR_RATING_INFO.stars_2.menu_value),
            new StringSelectMenuOptionBuilder()
                .setLabel(STAR_RATING_INFO.stars_3.menu_label)
                .setDescription(STAR_RATING_INFO.stars_3.menu_description)
                .setValue(STAR_RATING_INFO.stars_3.menu_value)
        );
    
    const confirm = new ButtonBuilder()
        .setCustomId('confirm')
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