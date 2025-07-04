// Database definition for ThreadUsers
// Stores per-thread user data

module.exports = (sequelize, DataTypes) => {
    const ThreadUser = sequelize.define('thread_users', {
        // FOREIGN KEYS
        thread_id: {
            // Thread id (from Threads model).
            type: DataTypes.STRING(31),
            references: {
                model: 'threads',
                key: 'thread_id',
            }
        },
        user_id: {
            // User id (from Users model).
            type: DataTypes.STRING(31),
            references: {
                model: 'users',
                key: 'user_id',
            }
        },
        // UHHH OTHER PROPERTIES
        active_contract_message_id: {
            // The message id of the user's active contract. `null` if the
            // user has no active contract, either because the user has
            // never posted a contract in the thread, or because their
            // last contract has already been accepted.
            type: DataTypes.STRING(31),
            allowNull: true
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
            allowNull: true
        },
    }, 
    {
        timestamps: false,
    });

    return ThreadUser;
};