var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');


var PORT = process.env.PORT || 3000;
var middleware = require('./middleware.js')(db);

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

// app.use(middleware.requireAuthentication);
// app.use(middleware.logger);
app.use(bodyParser.json());

app.get('/todd', function(request, response){

	var todd = [{
		id: 0,
		isGay: 'maybe',
		description: 'Hi, I\'m Todd. I love pounding buttholes'
	}]

	response.json(todd)
});

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

app.get('/about', function(request, response){

	response.send('About us!');
});

app.get('/todos', middleware.requireAuthentication, function(request, response){

	var query = request.query;

	var where = { 

		userId: request.user.get('id')

	};

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

app.get('/todos/:id', middleware.requireAuthentication, function(request, response){

	var todoID = parseInt(request.params.id, 10);

	db.todo.findOne({
		where: {
			id: todoID,
			userId: request.user.get('id')
		}
	}).then(function(todo){
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


app.post('/todos', middleware.requireAuthentication, function(request, response){

	var body = _.pick(request.body, 'description', 'completed');
	db.todo.create(body).then(function(todo){
		request.user.addTodo(todo).then(function(){
			return todo.reload();
		}).then(function(todo){
			response.json(todo.toJSON());
		});

	}, function(e){

		response.status(400).json(e);
	});

});


app.put('/todos/:id', middleware.requireAuthentication, function(request, response){

	var todoID = parseInt(request.params.id, 10);
	var body = _.pick(request.body, 'description', 'completed');
	var attributes = {};

	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) 
	{
		attributes.completed = body.completed;
	}

	if(body.hasOwnProperty('description') && _.isString(body.description))
	{
		attributes.description = body.description;
	}

	if(_.isEmpty(attributes))
	{
		response.status(400).json({error: 'no valid attributes sent'});
		return;
	}

	db.todo.findOne({
		where: {
			id: todoID,
			userId: request.user.get('id')
		}
	}).then(function(todo){

		if(todo)
		{
			todo.update(attributes).then(function(todo){
				response.json(todo.toJSON());
			}, function (e){
				response.status(400).json(e);
			});
		}
		else
		{
			response.status(404).send();

		}
	}, function () {
		response.status(500).send();
	});

});

app.delete('/todos/:id', middleware.requireAuthentication, function(request, response){

	var todoID = parseInt(request.params.id, 10);

	db.todo.destroy({
		where: {
			id: todoID,
			userId: request.user.get('id')
		}
	}).then(function(destroyedRows){
		if (destroyedRows === 0)
		{
			response.sendStatus(404)
		}
		else{
			response.status(204).json({status: 'deleted'});
		}
	}, function(){
		response.status(500).send();
	});

});

app.post('/users', function(request, response){

	var body = _.pick(request.body, 'email', 'password');

	db.user.create(body).then(function(user){

		response.json(user.toPublicJSON());

	}, function(e){

		console.log(e);
		//response.status(400).json({error: 'failure to insert into the database'});
		response.status(400).json(e);
	});

});

app.post('/users/login', function(request, response){

	var body = _.pick(request.body, 'email', 'password');

	console.log('authenticating...');

	db.user.authenticate(body).then(function(user){
		var token = user.generateToken('authentication');

		if(token)
		{
			response.header('Auth', token).json(user.toPublicJSON());
		}
		else
		{
			console.log('NOOOOPE');
			response.sendStatus(401);
		}
		

	}, function(){
		console.log('NOOOOPE');
		response.sendStatus(401);
	});
});

app.use(express.static(__dirname + '/public'));

db.sequelize.sync({force: true}).then(function(){

	app.listen(PORT, function(){

		console.log('Express server started on port: ' + PORT + '!');
	});

});

