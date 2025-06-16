// Database definition for Settings
// Stores various things set by using admin commands.

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('settings', {
        identifier: {
            // Identifier for these settings.
            type: DataTypes.STRING(31),
            primaryKey: true
        },
        feedback_channel_id: {
            // The forum channel where feedback contracts can be made.
            type: DataTypes.STRING(31)
        },
        feedback_tag_id: {
            // The forum tag that enables feedback contracts in the thread.
            type: DataTypes.STRING(31)
        },
        contract_cooldown: {
            // The minimum cooldown seconds between posting a contract in the same thread
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        staff_is_protected: {
            // Whether staff are protected from data modifying commands, 1 = yes, 0 = no
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        }
	}, {
		timestamps: false,
	});
};