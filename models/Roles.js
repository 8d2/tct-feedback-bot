// Database definition for Roles
// Stores individual data about a role requirement

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('roles', {
        role_type: {
            // Type of role to set (regular feedback, veteran feedback, etc.)
            type: DataTypes.STRING(31),
            primaryKey: true
        },
        role_id: {
            // The set role's id.
            type: DataTypes.STRING(31),
        },
        role_requirement: {
            // The requirement for the role.
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false
        },
    }, {
        timestamps: false,
    });
};