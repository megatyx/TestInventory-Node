var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');


var PORT = process.env.PORT || 3000;
var middleware = require('./Model/middleware.js');

var todos = []

var todoNextId = 1;

var autoComplete = {
		faqs: [
			{
				name: "hello",
				id: 0,
				description: "some description",
				question: "Home Loans",
				answer: "This is my answer"
			}

		]
	}

app.use(middleware.requireAuthentication);
app.use(middleware.logger);
app.use(bodyParser.json());


app.get('/ask/:id', function(request, response){

	var answerID = request.params.id
	var matchedObject = _.findWhere(autoComplete.faqs, {id: answerID});

	if(matchedObject)
	{
		response.json({faqs: [matchedObject]});
	}
	else
	{
		response.status(404).json({error: answerID + " not found"});
	}
	
});

app.get('/econ/:keyword', function(request, response){

	var keyword = request.params.keyword
	var matchedObject = _.findWhere(autoComplete.faqs, {question: keyword});

	if(matchedObject)
	{
		response.json({faqs: [matchedObject]});
	}
	else
	{
		response.status(404).json({error: keyword + " not found"});
	}
	
});

app.get('/', function(request, response){

	response.send('Todo API ROOT')
});

app.get('/todos', function(request, response){

	var queryParams = request.query;
	var filteredTodos = todos;

	if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true')
	{

		filteredTodos = _.where(filteredTodos,{ completed: true});

	} else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false'){

		filteredTodos = _.where(filteredTodos,{ completed: false});
	}

	if(queryParams.hasOwnProperty('des') && queryParams.des.length > 0)
	{

		filteredTodos = _.filter(filteredTodos, function(todo){

			return todo.description.toLowerCase().indexOf(queryParams.des.toLowerCase()) > -1;

		});
	}

	response.json(filteredTodos);

});

app.get('/todos/:id', function(request, response){

	var todoID = parseInt(request.params.id, 10);

	var matchedTodo = db.todo.findById(todoID).then(function(todo){

		if(!!todo)
		{
			response.json(todo.toJSON());
		}
		else{
			response.status(404).send();
		}

	}, function(e){
		response.status(500).send();
	});
	
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

	var body = _.pick(request.body, 'description', 'completed');

	db.todo.create(body).then(function(todo){

		response.json(todo.toJSON());

	}, function(e){

		response.status(400).json(e);
	});

	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {

	// 	return response.sendStatus(400)
	// }

	// body.description = body.description.trim()


	// body.id = todoNextId++;

	// todos.push(body);

	// response.json(body);

});


app.put('/todos/:id', function(request, response){

	var todoID = parseInt(request.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoID});
	var body = _.pick(request.body, 'description', 'completed');
	var validAttributes = {};

	if(!matchedTodo)
	{
		return response.status(404).send()
	}

	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) 
	{
		validAttributes.completed = body.completed;

	}else if (body.hasOwnProperty('completed')){
		return response.status(400).send()
	}

	if(body.hasOwnProperty('description') && _.isString(body.description))
	{

		validAttributes.description = body.description
	}else if(body.hasOwnProperty('description'))
	{
		return response.status(400).send()
	}

	_.extend(matchedTodo, validAttributes);

	response.json(matchedTodo);

});

app.delete('/todos/:id', function(request, response){

	var todoID = parseInt(request.params.id, 10);

	var matchedTodo = _.findWhere(todos, {id: todoID});

	if(!matchedTodo)
	{
		response.status(404).json({"error": "Not Found"});
	}
	else
	{
		todos = _.without(todos, matchedTodo);
		response.json(matchedTodo);
	}

});

app.use(express.static(__dirname + '/public'));

db.sequelize.sync().then(function(){

	app.listen(PORT, function(){

		console.log('Express server started on port: ' + PORT + '!');
	});

});

