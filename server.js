var express = require('express');
var app = express();
var bodyParser = require('body-parser');


var PORT = process.env.PORT || 3000;
var middleware = require('./Model/middleware.js');

var todos = []

var todoNextId = 1;

app.use(middleware.requireAuthentication);
app.use(middleware.logger);
app.use(bodyParser.json());

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
		response.json(matchedTodo);
	}
	else
	{
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


app.post('/todos', function(request, response){

	var body = request.body;

	body.id = todoNextId++;

	todos.push(body);

	console.log(todos);

	response.json(body);

});

app.use(express.static(__dirname + '/public'));

app.listen(PORT, function(){

	console.log('Express server started on port: ' + PORT + '!');
});