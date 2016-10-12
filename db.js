var Sequelize = require('sequelize');
var sequelize;

if (process.env.NODE_ENV === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
    });
}
else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		dialect: 'sqlite',
		storage: __dirname + '/data/dev-inventory-api.sqlite'
	});
}

var db = {};

db.item = sequelize.import(__dirname + '/model/item.js');
db.user = sequelize.import(__dirname + '/model/user.js');
db.token = sequelize.import(__dirname + '/model/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.item.belongsTo(db.user);
db.user.hasMany(db.item);


module.exports = db;