// Defines database. Could be changed to different database here if we want to use something other than SQLite.

const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

module.exports = {
    dataTypes: Sequelize.DataTypes,
    sequelize
}