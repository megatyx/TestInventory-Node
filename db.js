var Sequelize = require('sequelize');
var sequelize;

//if (process.env.HEROKU_POSTGRESQL_BRONZE_URL) {
    // the application is executed on Heroku ... use the postgres database
    // sequelize = new Sequelize(process.env.DATABASE_URL, {
    //   logging:  false
    // });
//}
// else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
		dialect: 'sqlite',
		storage: __dirname + '/data/dev-todo-api.sqlite'
	});
// }

var db = {};

db.todo = sequelize.import(__dirname + '/Model/todo.js');

db.sequelize = sequelize;
db.Sequelize = Sequelize;


module.exports = db;