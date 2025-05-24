// Database definition for Collaborators
// Collaborators are stored by ID and thread ID in permissionMethods

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('collaborators', {
		collaboration_id: {
            // Collaboration id. this is formatted as `${collaboratorUserId}_${threadId}`
			type: DataTypes.STRING(63),
			primaryKey: true
		}
	}, {
		timestamps: false,
	});
};