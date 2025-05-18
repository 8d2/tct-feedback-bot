// Defines helper methods within database models.
// For example, getting a user could call some method user.foo() if defined here.

const { SETTINGS_MAIN_IDENTIFIER, Channels, Collaborators, Roles, Settings, Tags, Threads, Users } = require('./dbHandler.js');

/**
 * Allows for `Settings.getRoles()` to retrieve all from Roles database.
 */
Reflect.defineProperty(Settings.prototype, 'getRoles', {
	value: () => {
		return Roles.findAll();
	},
});

/**
 * Allows for `Settings.getRole(type)` to retrieve Role for a role type.
 */
Reflect.defineProperty(Settings.prototype, 'getRole', {
	value: type => {
		return Roles.findOne({
			where: { role_type: type }
		})
	},
});

/**
 * Allows for `Settings.getChannels()` to retrieve all from Channels database.
 */
Reflect.defineProperty(Settings.prototype, 'getChannels', {
	value: () => {
		return Channels.findAll();
	},
});

/**
 * Allows for `Settings.addChannel(id)` to add a channel to Channels database.
 */
Reflect.defineProperty(Settings.prototype, 'addChannel', {
	value: async id => {
		await Channels.findOrCreate({
			where: { channel_id: id }
		});
	},
});

/**
 * Allows for `Settings.removeChannel(id)` to remove a channel from Channels database.
 */
Reflect.defineProperty(Settings.prototype, 'removeChannel', {
	value: async id => {
		await Channels.destroy({
			where: { channel_id: id }
		})
	},
});

/**
 * Allows for `Settings.getTags()` to retrieve all from Tags database.
 */
Reflect.defineProperty(Settings.prototype, 'getTags', {
	value: () => {
		return Tags.findAll();
	},
});

/**
 * Allows for `Settings.addTag(id)` to add a tag to ChaTagsnnels database.
 */
Reflect.defineProperty(Settings.prototype, 'addTag', {
	value: async id => {
		await Tags.findOrCreate({
			where: { tag_id: id }
		});
	},
});

/**
 * Allows for `Settings.removeTag(id)` to remove a tag from Tags database.
 */
Reflect.defineProperty(Settings.prototype, 'removeTag', {
	value: async id => {
		await Tags.destroy({
			where: { tag_id: id }
		})
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