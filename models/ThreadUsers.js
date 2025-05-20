// Database definition for ThreadUsers
// Stores per-thread user data

module.exports = (sequelize, DataTypes) => {
	const ThreadUser = sequelize.define('thread_users', {
        thread_id: {
            // Thread id.
			type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
		},
		user_id: {
            // User id.
			type: DataTypes.BIGINT.UNSIGNED,
            allowNull: false
		},
        last_contract_posted: {
            // A date representing when the user last posted a contract
            // in this thread.
            type: DataTypes.DATE,
            defaultValue: new Date(2000),
            allowNull: false
        },
	}, 
    {
		timestamps: false,
	});

    return ThreadUser;
};