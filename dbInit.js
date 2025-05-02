// Call node dbInit.js to re-initialize the database.
// Will empty and remake database.sqlite which can erase data!

// Database definition
const { sequelize, dataTypes } = require("./dbDefinition")

// Create models from definition. So far only Users.
require('./models/Users.js')(sequelize, dataTypes);

// Sync database
const force = process.argv.includes('--force') || process.argv.includes('-f');
sequelize.sync({ force }).then(async () => {
	// Called when syncing; sync any database models here using Promise
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);