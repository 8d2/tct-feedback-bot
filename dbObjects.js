// Defines helper methods within database models.
// For example, getting a user could call some method user.foo() if defined here.

const { SETTINGS_MAIN_IDENTIFIER, Roles, Settings, Users, Threads, Collaborators } = require('./dbHandler.js');

/**
 * Allows for `Settings.getRoles()` to retrieve all from Roles database.
 */
Reflect.defineProperty(Settings.prototype, 'getRoles', {
	value: () => {
		return Roles.findAll();
	},
});
/**
 * Allows for `Settings.getRoles(type)` to retrieve Role for a role type.
 */
Reflect.defineProperty(Settings.prototype, 'getRole', {
	value: type => {
		return Roles.findOne({
			where: { role_type: type }
		})
	},
});

/**
 * Allows for `Roles.settings` to reference main settings from role.
 */
Reflect.defineProperty(Roles.prototype, 'settings', {
	value: Settings.findOne({
		where: { identifier: SETTINGS_MAIN_IDENTIFIER }
	})
})

module.exports = {
	SETTINGS_MAIN_IDENTIFIER,
	Roles,
	Settings,
	Users,
    Threads,
    Collaborators
}