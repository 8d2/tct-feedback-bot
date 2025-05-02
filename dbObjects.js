const { sequelize, dataTypes } = require("./dbDefinition")

const Users = require('./models/Users.js')(sequelize, dataTypes);

Reflect.defineProperty(Users.prototype, 'isBlocked', {
	value: () => {
		const user = Users.findOne({
			where: { user_id: this.user_id },
		});

		if (user) {
			return user.is_blocked;
		}
		return false;
	},
});

module.exports = {
	Users
}