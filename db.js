var Sequelize = require('sequelize');
var sequelize;

if(process.env.HEROKU_POSTGRESQL_BRONZE_URL)
{
	sequelize = new Sequelize(HEROKU_POSTGRESQL_BRONZE_URL, {
		dialect: 'postgres',
		protocol: 'postgres'
	});

} 
else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		dialect: 'sqlite',
		storage: __dirname + '/data/dev-todo-api.sqlite'
	});
}

var db = {};

db.todo = sequelize.import(__dirname + '/Model/todo.js');

db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;