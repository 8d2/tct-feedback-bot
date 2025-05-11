// Utility methods

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

module.exports = {
    getPluralSuffix,
    pluralize
}