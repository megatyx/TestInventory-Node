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

	var query = request.query;

	var where = {};

	if(query.hasOwnProperty('completed') && query.completed === 'true'){

		where.completed = true;
	}
	else if (query.hasOwnProperty('completed') && query.completed === 'false')
	{

		where.completed = false;
	}

	if(query.hasOwnProperty('des') && query.des.length > 0)
	{

		where.description = {
			$like: '%'+ query.des + '%'
		}
	}

	db.todo.findAll({where: where}).then(function(todos){
		response.json(todos);
	}, function(e){
		response.status(500).send();
	});

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

});


app.put('/todos/:id', function(request, response){

	var todoID = parseInt(request.params.id, 10);
	var body = _.pick(request.body, 'description', 'completed');
	var attributes = {};

	if(body.hasOwnProperty('completed')) 
	{
		attributes.completed = body.completed;

	}

	if(body.hasOwnProperty('description'))
	{

		attributes.description = body.description;
	}

	db.todo.findById(todoID).then(function(todo){

		if(todo)
		{
			return todo.update(attributes);
		}
		else
		{
			response.status(404).send();

		}
	}, function () {
		response.status(500).send();
	}).then(function (todo) {

		response.json(todo.toJSON());
	}, function (e) {
		response.status(400).json(e);
	});

});

app.delete('/todos/:id', function(request, response){

	var todoID = parseInt(request.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoID
		}
	}).then(function(destroyedRows){
		if (destroyedRows === 0)
		{
			response.status(404).json({
				error: 'No todo with id'
			});
		}
		else{
			response.status(204).send();
		}
	}, function(){
		response.status(500).send();
	});

});

app.use(express.static(__dirname + '/public'));

db.sequelize.sync().then(function(){

	app.listen(PORT, function(){

		console.log('Express server started on port: ' + PORT + '!');
	});

});

