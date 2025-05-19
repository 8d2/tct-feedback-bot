// Database definition for Tags
// Stores all feedback tags that must be added for contracts to be made.

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('tags', {
        tag_id: {
            // The forum tag that enables feedback contracts in the thread.
            type: DataTypes.STRING,
            primaryKey: true
        }
	}, {
		timestamps: false,
	});
};