// Database definition for Channels
// Stores all feedback channels where contracts can be made.

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('channels', {
        channel_id: {
            // The forum channel where feedback contracts can be made.
            type: DataTypes.STRING,
            primaryKey: true
        }
	}, {
		timestamps: false,
	});
};