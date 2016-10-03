var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	dialect: 'sqlite',
	storage: __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {

	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {

			notEmpty: true,
			len: [1,250]
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

sequelize.sync({


}).then(function(){
	console.log('Everything is synced');

	Todo.findById(2).then(function(todo){

		if (todo){

			console.log(todo.toJSON());
		}
		else{
			console.log('Todo not found');
		}

	}).catch(function(e){
		console.log(e);
	});

	// Todo.create({
	// 	description: "Take out the trash",
	// 	completed: false
	// }).then(function(){

	// 	return Todo.create({

	// 		description: "Clean Office"

	// 	});
	// }).then(function(){

	// 	return Todo.findAll({

	// 		where: {

	// 			description: {

	// 				$like: '%office'
	// 			}
	// 		}

	// 	});

	// }).then(function(todos){

	// 	if(todos)
	// 	{
	// 		todos.forEach(function(todo){

	// 			console.log(todo.toJSON());
	// 		});
	// 	}
	// 	else
	// 	{
	// 		console.log("no todo found");
	// 	}

	// }).catch(function(e){

	// 	console.log(e)
	// });
});
