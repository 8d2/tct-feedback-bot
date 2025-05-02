module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
        is_blocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        feedback_points: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        }
	}, {
		timestamps: false,
	});
};