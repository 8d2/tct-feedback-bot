// Database definition for Collaborators
// Collaborators are stored by ID and thread ID in permissionMethods

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('collaborators', {
		collaboration_id: {
            // Collbaration id. this is formatted as `${collaboratorUserId}_${threadId}`
			type: DataTypes.STRING,
			primaryKey: true
		}
	}, {
		timestamps: false,
	});
};