// Utility methods

const constants = require("./constants.js");

/**
 * Returns a suffix to use for the amount to concat and pluralizea word or not.
 * @return {string} Pluralizing or not suffix.
 */
function getPluralSuffix(amount) {
    return amount == 1 ? "" : "s";
}

/**
 * Pluralizes a string in the format "n <str>" depending on what number n is.
 * @return {string} Pluralized string.
 */
function pluralize(amount, str) {
    return amount + " " + str + getPluralSuffix(amount);
}

/**
 * Concats every item of the array together using a separator.
 * @param {Array} array Array to concat.
 * @param {string} separator The separator to use between each item.
 * @param {int} trimEnd How much off the end of the array to exclude from the separator (1 = last item is not concatenated).
 * @return {string} The produced concatenated array.
 */
function concat(array, separator = ", ", trimEnd = 0) {
    return array.slice(0, array.length - trimEnd).join(separator);
}

/**
 * Concats every item of the array together in a list format, using "and" and comma separators.
 * Ex: concatList([item1, item2, item3]) -> item1, item2 & item3
 *     concatList([item1, item2]) -> item1 & item2
 * @param {Array} array Array to concat.
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

module.exports = {
    getPluralSuffix,
    pluralize,
    concat,
    concatList
}