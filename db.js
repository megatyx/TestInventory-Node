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
		storage: __dirname + '/data/dev-todo-api.sqlite'
	});
}

var db = {};

db.todo = sequelize.import(__dirname + '/model/todo.js');

db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;