// Database definition for Users
// Each user is stored by user id in userMethods

const { dataTypes } = require("../dbDefinition");

module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
            // User id.
			type: DataTypes.STRING,
			primaryKey: true
		},
        accepted_rules: {
            // If user has read and accepted the rules.
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        is_blocked: {
            // If user is blocked from making feedback contracts.
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        allow_pings: {
            // If the user will receive a ping on contract creation in their thread.
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false
        },
        feedback_points: {
            // How many feedback points user has.
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
	}, {
		timestamps: false,
	});
};