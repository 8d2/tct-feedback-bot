// Utility methods

const { Channel, Client, User } = require("discord.js");
const constants = require("./constants.js");

let storedClient = null;

/**
 * Concats every item of the array together using a separator.
 * @param {Array} array Array to concat.
 * @param {string} separator The separator to use between each item.
 * @param {int} trimEnd How much off the end of the array to exclude from the separator (1 = last item is not concatenated).
 * @return {string} The produced concatenated array.
 */
function concat(array, separator = ", ", trimEnd = 0) {
    if (trimEnd == 0) {
        return array.join(separator);
    }
    return array.slice(0, array.length - trimEnd).join(separator);
}

/**
 * Concats every item of the array together in a list format, using "and" and comma separators.
 * Ex: concatList([item1, item2, item3]) -> item1, item2 & item3
 *     concatList([item1, item2]) -> item1 & item2
 * @param {string[]} array Array to concat.
 * @param {string} empty String to use if no elements are within the array.
 * @param {string} separator The separator to use between each item. "," by default.
 * @param {string} and The separator to use between the second to last and last item. "&" by default.
 * @return {string} The produced concatenated array in list format.
 */
function concatList(array, empty = constants.OPTION_NULL, separator = ", ", and = "&") {
    if (array.length == 0) {
        // No elements, use empty phrase
        return empty;
    }
    if (array.length == 1) {
        // Only one element, return that
        return `${array[0]}`;
    }
    // Concat in a list all elements but the last, then add last using "and"
    return concat(array, separator, 1) + " " + and + " " + `${array[array.length - 1]}`;
}

/**
 * Gets a channel by ID. (An actual Discord channel object,
 * not a channel from the bot's database.)
 * @param {string} channelId The channel ID.
 * @returns {Channel?} A Discord channel corresponding to the ID.
 */
async function getChannelById(channelId) {
    if (!storedClient) {
        console.warn(`${getChannelById.name} failed; client has not been loaded yet`);
        return;
    }
    return await client.channels.fetch(channelId);
}

/**
 * Returns a suffix to use for the amount to concat and pluralize a word or not.
 * @return {string} Pluralizing or not suffix.
 */
function getPluralSuffix(amount) {
    return amount == 1 ? "" : "s";
}

/**
 * From the amount and provided units, returns how much of each unit the amount takes up.
 * @param {int} amount The amount to get units of.
 * @param {Array.<{name: string, conversion: int?}} units List of units to convert amount from.
 * @returns {Object.<string, int>} A dictionary from each unit's name to the amount of units.
 */
function getUnitAmounts(amount, units) {
    const unitAmounts = {};
    let counter = amount;
    for (const unit of units) {
        const converted = unit.conversion != null ? Math.floor(counter / unit.conversion) : counter;
        unitAmounts[unit.name] = converted;
        if (converted > 0 && unit.conversion != null) {
            counter -= converted * unit.conversion;
        }
    }
    return unitAmounts;
}

/**
 * Gets a channel by ID. (An actual Discord channel object,
 * not a channel from the bot's database.)
 * @param {string} channelId The channel ID.
 * @returns {User?} A Discord channel corresponding to the ID.
 */
async function getUserById(userId) {
    if (!storedClient) {
        console.warn(`${getUserById.name} failed; client has not been loaded yet`);
        return;
    }
    return await client.users.fetch(userId);
}

/**
 * Returns a string describing time units encapsulated by the provided amount of seconds. Goes up to weeks.
 * Ex: getTimeDisplay(3600) = "1 hour", getTimeDisplay(86400) = "1 day", getTimeDisplay(7261) = "2 hours, 1 minute, 1 second"
 * @param {int} seconds Seconds to parse.
 * @returns {string} Formatted string of the seconds in time units.
 */
function getTimeDisplay(seconds) {
    const unitAmounts = getUnitAmounts(seconds, constants.TIME_CONVERSIONS);
    return concat(
        Object.keys(unitAmounts).filter(name => unitAmounts[name] > 0).map(name => pluralize(unitAmounts[name], name))
    );
}

/**
 * Pluralizes a string in the format "n <str>" depending on what number n is.
 * @return {string} Pluralized string.
 */
function pluralize(amount, str) {
    return amount + " " + str + getPluralSuffix(amount);
}

module.exports = {
    concat,
    concatList,
    getChannelById,
    getPluralSuffix,
    getTimeDisplay,
    getUserById,
    pluralize,

    /**
     * Initialize channel helper functions.
     * @param {Client} client The bot's client.
     */
    async init(client) {
        storedClient = client;
    },
}