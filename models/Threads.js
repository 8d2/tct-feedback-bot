// Database definition for Threads
// Threads are stored by thread ID in permissionMethods

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('threads', {
		thread_id: {
            // Thread ID
			type: DataTypes.STRING,
			primaryKey: true
		},
        collaborator_count: {
            // Number of collaborators associated with this thread, including the owner.
			type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false
		}
	}, {
		timestamps: false,
	});
};