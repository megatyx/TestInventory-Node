var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var middleware = require('./Model/middleware.js');

var todos = [{

	id:1,
	description: 'meet mom for lunch',
	completed: false

	}, {

		id: 2,
		description: 'Go to market',
		completed: false
	},
	{
		id: 3,
		description: 'Feed the cat',
		completed: true
	}
]

app.use(middleware.requireAuthentication);
app.use(middleware.logger);

app.get('/', function(request, response){

	response.send('Todo API ROOT')
});

app.get('/todos', function(request, response){

	response.json(todos);

});

app.get('/todos/:id', function(request, response){

	var todoID = parseInt(request.params.id, 10);
	console.log(todoID);
	var matchedTodo;

	todos.forEach(function(todo) {
		if (todoID === todo.id)
		{
			matchedTodo = todo
		}

	});

	if(matchedTodo)
	{

		//response.json(matchedTodo);
		response.json(matchedTodo);
	}
	else
	{
		//response.status(404);
		response.sendStatus(404);
	}
	
});

app.get('/todd', function(request, response){

	var todd = [{
		id: 0,
		isGay: 'maybe',
		description: 'Hi, I\'m Todd. I love pounding buttholes'
	}]

	response.json(todd)
});

app.get('/about', middleware.requireAuthentication, function(request, response){

	response.send('About us!');
});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function(){

	console.log('Express server started on port: ' + PORT + '!');
});