// Database definition for Settings
// Stores various things set by using admin commands.

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('settings', {
        identifier: {
            // Identifier for these settings.
            type: DataTypes.STRING,
            primaryKey: true
        },
        feedback_channel_id: {
            // The forum channel where feedback contracts can be made.
            type: DataTypes.STRING
        },
        feedback_tag_id: {
            // The forum tag that enables feedback contracts in the thread.
            type: DataTypes.STRING
        }
	}, {
		timestamps: false,
	});
};