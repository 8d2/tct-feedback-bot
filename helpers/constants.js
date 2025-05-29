// Constant values
const { bold, strikethrough, underline, subtext, inlineCode } = require("discord.js");

const COMMAND_NOT_IMPLEMENTED_DESC = "This command has not been fully implemented."
const ID_CHARACTER_LIMIT = 30; // discord IDs are unsigned 8 byte ints, the maximum length for an ID string is 19 chars.
const ID_CHARACTER_LIMIT_DESC = `The maximum length for this value is ${ID_CHARACTER_LIMIT} characters.`;
const MESSAGE_SENT_CONFIRM_MESSAGE = "The message has been sent."
const MESSAGE_SENT_FAILED_MESSAGE = "The message failed to send."
const MESSAGE_SENT_PERMISSION_FAILED_MESSAGE = "The message failed to send due to lack of permissions."
const ALLOW_PINGS_MESSAGE_TRUE = "You will now recieve pings for contract actions, including contracts posted in your threads, or when your contracts are accepted.";
const ALLOW_PINGS_MESSAGE_FALSE = "You will no longer recieve pings for contract related actions.";
const UPDATE_ALL_ROLES_ERROR = "Failed to update roles of users due to an error. Make sure the bot has the correct permissions.";
const UPDATE_ALL_ROLES_SUCCESS = "Successfully updated the roles of all users.";
const OPTION_NULL_NO_FORMAT = "N/A";
const OPTION_NULL = inlineCode(OPTION_NULL_NO_FORMAT);
const LEADERBOARD_EMPTY_MESSAGE = "Nobody has any points yet...";
const LEADERBOARD_SEPARATOR = "‧‧‧";
const LEADERBOARD_MAX_DISPLAY = 10;
const MISSING_ACCESS_CODE = 50001;          // For roles
const MISSING_PERMISSIONS_CODE = 50013;     // For messages
const FEEDBACK_AGREEMENT_TITLE = "Feedback Agreement"
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
const INTERACTION_NOT_BUILDER_ERROR = "You cannot interact with feedback contracts since you are not a builder in this thread.";
const CONTRACT_STAR_SELECT_CUSTOM_ID = "feedback-contract-star-select";
const CONTRACT_CONFIRM_CUSTOM_ID = "feedback-contract-confirm";
const CONTRACT_RULES_ACCEPT_ID = "feedback-contract-rules-accept";

module.exports = {
    COMMAND_NOT_IMPLEMENTED_DESC,
    MESSAGE_SENT_CONFIRM_MESSAGE,
    MESSAGE_SENT_FAILED_MESSAGE,
    MESSAGE_SENT_PERMISSION_FAILED_MESSAGE,
    ALLOW_PINGS_MESSAGE_TRUE,
    ALLOW_PINGS_MESSAGE_FALSE,
    UPDATE_ALL_ROLES_ERROR,
    UPDATE_ALL_ROLES_SUCCESS,
    OPTION_NULL_NO_FORMAT,
    OPTION_NULL,
    LEADERBOARD_EMPTY_MESSAGE,
    LEADERBOARD_SEPARATOR,
    LEADERBOARD_MAX_DISPLAY,
    MISSING_ACCESS_CODE,
    MISSING_PERMISSIONS_CODE,
    FEEDBACK_AGREEMENT_TITLE,
    HORIZONTAL_RULE,
    STAR_RATING_INFO,
    INTERACTION_NOT_BUILDER_ERROR,
    CONTRACT_STAR_SELECT_CUSTOM_ID,
    CONTRACT_CONFIRM_CUSTOM_ID,
    CONTRACT_RULES_ACCEPT_ID,
    ID_CHARACTER_LIMIT,
    ID_CHARACTER_LIMIT_DESC
}