// Defines bot databases, including initializing databases and helper methods.
// Call node dbHandler.js -s to re-initialize the database.
// Supplying --force or -f will empty and remake database.sqlite which will erase data.

// Database definition
const { sequelize, dataTypes } = require("./dbDefinition")

// Constants
const SETTINGS_MAIN_IDENTIFIER = "main";

// Models
const Channels = require('./models/Channels.js')(sequelize, dataTypes);
const Collaborators = require('./models/Collaborators.js')(sequelize, dataTypes);
const Roles = require('./models/Roles.js')(sequelize, dataTypes);
const Settings = require('./models/Settings.js')(sequelize, dataTypes);
const Tags = require('./models/Tags.js')(sequelize, dataTypes);
const Threads = require('./models/Threads.js')(sequelize, dataTypes);
const ThreadUsers = require('./models/ThreadUsers.js')(sequelize, dataTypes);
const Users = require('./models/Users.js')(sequelize, dataTypes);

// Relationships
Threads.hasMany(ThreadUsers);
ThreadUsers.belongsTo(Threads, {foreignKey: 'thread_id'});
ThreadUsers.belongsTo(Users, {foreignKey: 'user_id'});
Users.hasMany(ThreadUsers);

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
			Settings.upsert({identifier: SETTINGS_MAIN_IDENTIFIER})
		]);


		// All synced!
		console.log('Database synced');
	
		sequelize.close();
	}).catch(console.error);
}

module.exports = {
	SETTINGS_MAIN_IDENTIFIER,
	Channels,
	Collaborators,
	Roles,
	Settings,
	Tags,
	Threads,
	ThreadUsers,
	Users,
    Collaborators
}