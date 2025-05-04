// Defines bot databases, including initializing databases and helper methods.
// Call node dbHandler.js -s to re-initialize the database.
// Supplying --force or -f will empty and remake database.sqlite which will erase data.

// Database definition
const { sequelize, dataTypes } = require("./dbDefinition")

// Constants
const SETTINGS_MAIN_IDENTIFIER = "main";

// Models
const Roles = require('./models/Roles.js')(sequelize, dataTypes);
const Settings = require('./models/Settings.js')(sequelize, dataTypes);
const Users = require('./models/Users.js')(sequelize, dataTypes);

// Command arguments
const force = process.argv.includes('--force') || process.argv.includes('-f');
const sync = process.argv.includes('--sync') || process.argv.includes('-s');

// Sync database
if (sync) {
	if (force) {
		console.log('Database force supplied; data will be emptied!');
	}
	sequelize.sync({ force }).then(async () => {
		// Make sure the main settings database item is there.
		await Promise.all([
			Settings.upsert({identifier: SETTINGS_MAIN_IDENTIFIER}),

			// Temporary for testing, would be set in settingsMethods
			Roles.upsert({
				role_type: "Regular",
				role_id: 999999999,
				role_requirement: 5
			})
		]);


		// All synced!
		console.log('Database synced');
	
		sequelize.close();
	}).catch(console.error);
}

module.exports = {
	SETTINGS_MAIN_IDENTIFIER,
	Roles,
	Settings,
	Users
}