// Defines helper methods within database models.
// For example, getting a user could call some method user.foo() if defined here.

const { SETTINGS_MAIN_IDENTIFIER, Roles, Settings, Users } = require('./dbHandler.js');

Roles.belongsTo(Settings, {foreignKey: 'settings_identifier', as: 'settings'})

/**
 * Allows for `Settings.getRoles` to retrieve all from Roles database.
 */
Reflect.defineProperty(Settings.prototype, 'getRoles', {
	value: () => {
		return Roles.findAll({
			include: ['settings']
		});
	},
});

module.exports = {
	SETTINGS_MAIN_IDENTIFIER,
	Roles,
	Settings,
	Users
}