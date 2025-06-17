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
        is_blocked: {
            // Whether the user (corresponding to user_id) is blocked from 
            // posting contracts in the thread (corresponding to thread_id).

            // This is not implemented and is not specified in any design documents.
            // However, this feature may become a necessity in the future,
            // and updating the database post-deployment would kinda suck.
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        is_collaborator: {
            // Whether the user (corresponding to user_id) is a collaborator
            // in the thread (corresponding to thread_id).
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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