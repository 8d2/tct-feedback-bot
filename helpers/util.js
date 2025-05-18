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
 * @param {int} indexTrim How much off the end of the array to exclude from the separator (1 = last item is not concatenated).
 * @return {string} The produced concatenated array.
 */
function concat(array, separator = ",", indexTrim = 0) {
    return array.reduce(
        (str, item, index) =>
            index >= array.length - indexTrim ? str : str + `${item}` + (index < array.length - indexTrim - 1 ? separator + " " : ""), ""
    );
}

/**
 * Concats every item of the array together in a list format, using "and" and comma separators.
 * @param {Array} array Array to concat.
 * @param {string} emptyPhrase String to use if no elements are within the array.
 * @return {string} The produced concatenated array in list format.
 */
function concatList(array, emptyPhrase = constants.OPTION_NULL, andPhrase = "&") {
    if (array.length == 0) {
        // No elements, use empty phrase
        return emptyPhrase;
    }
    if (array.length == 1) {
        // Only one element, return that
        return `${array[0]}`;
    }
    // Concat in a list all elements but the last, then add last using "and"
    return concat(array, ",", 1) + " " + andPhrase + " " + `${array[array.length - 1]}`;
}

module.exports = {
    getPluralSuffix,
    pluralize,
    concat,
    concatList
}