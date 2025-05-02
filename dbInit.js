const { sequelize, dataTypes } = require("./dbDefinition")

require('./models/Users.js')(sequelize, dataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);