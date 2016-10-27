var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var path = require('path');
var fs = require('fs-extra');
var multer = require('multer');
var uploader = multer({dest: __dirname + '/images'}, {limits: {files: 1}})




var PORT = process.env.PORT || 3000;
var middleware = require('./middleware.js')(db);

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'public')));

app.get('/', function(request, response){

	response.json({success: 'inventory api root'});
});


app.post('/users', function(request, response){

	var body = _.pick(request.body, 'username', 'password');
	body.username = body.username;

	db.user.create(body).then(function(user){

		response.json(user.toPublicJSON());

	}, function(e){

		console.log(e);
		//response.status(400).json({error: 'failure to insert into the database'});
		response.sendStatus(400);
	});

});

app.post('/users/login', function(request, response){

	var body = _.pick(request.body, 'username', 'password');
	body.username = body.username;
	var userInstance;

	console.log('authenticating...');

	db.user.authenticate(body).then(function(user){
		var token = user.generateToken('authentication');
		userInstance = user;
		return db.token.create({
			token: token
		});
	}).then(function(tokenInstance){
		response.header('Auth', tokenInstance.get('token')).json(userInstance.toPublicJSON());

	}).catch(function(){
		console.log('NOOOOPE');
		response.sendStatus(401);
	});
});

app.delete('/users/logout', middleware.requireAuthentication, function(request, response){
	request.token.destroy().then(function(){
		response.sendStatus(204);
	}).catch(function(){
		response.sendStatus(500);
	});
});

app.get('/items', middleware.requireAuthentication, function(request, response){

	var query = request.query;

	var where = { 

		userId: request.user.get('id')

	};

	if(query.hasOwnProperty('quantity') && query.quantity >= 0)
	{

		where.quantity = {
			$like: '%'+ query.quantity + '%'
		}
	}

	if(query.hasOwnProperty('barcode') && query.barcode.length > 0)
	{

		where.barcode = {
			$like: '%'+ query.barcode + '%'
		}
	}

	if(query.hasOwnProperty('name') && query.name.length > 0)
	{

		where.name = {
			$like: '%'+ query.name + '%'
		}
	}

	if(query.hasOwnProperty('description') && query.description.length > 0)
	{

		where.description = {
			$like: '%'+ query.description + '%'
		}
	}

	db.item.findAll({where: where}).then(function(items){

			response.json(items);
		
	}, function(e){
		response.status(500).send();
	});

});


app.get('/items/:barcode', middleware.requireAuthentication, function(request, response){

	var barcode = request.params.barcode

	
	db.item.findOne({
		where: {
			barcode: barcode,
			userId: request.user.get('id')
		}
	}).then(function(item){
		if(!!item)
		{
			response.json(item.toJSON());
		}
		else{
			response.status(404).send();
		}

	}, function(e){
		response.status(500).send();
	});
});

app.post('/items', middleware.requireAuthentication, function(request, response){

	var body = _.pick(request.body, 'barcode', 'name', 'quantity', 'description', 'price');
	db.item.create(body).then(function(item){
		request.user.addItem(item).then(function(){
			return item.reload();
		}).then(function(item){
			response.json(item.toJSON());
		});

	}, function(e){

		response.status(400).json(e);
	});

});


app.put('/items', middleware.requireAuthentication, function(request, response){

	var body = _.pick(request.body, 'barcode', 'name', 'quantity', 'description');

	var attributes = {};

	if(body.hasOwnProperty('barcode') && _.isString(body.barcode))
	{
		attributes.barcode = body.barcode;
	}
	else
	{
		return response.status(404)
	}

	if(body.hasOwnProperty('name') && _.isString(body.name))
	{
		attributes.name = body.name;
	}

	if(body.hasOwnProperty('quantity') && _.isNumber(body.quantity))
	{
		attributes.quantity = body.quantity;
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


	db.item.findOne({
		where: {
			barcode: attributes.barcode,
			userId: request.user.get('id')
		}
	}).then(function(item){

		if(item)
		{
			item.update(attributes).then(function(item){
				response.json(item.toJSON());
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


app.delete('/items/:id', middleware.requireAuthentication, function(request, response){

	var itemID = parseInt(request.params.id, 10);

	db.item.destroy({
		where: {
			id: itemID,
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

// app.post('/items/image/upload/:id', 
// 	[middleware.requireAuthentication, 
// 	middleware.ensureFileDirectory, 
// 	middleware.emptyFileDirectory, 
// 	multer({dest: function(file){return __dirname + '/images';}, 
// 			limits: {files: 1}})], 
// 	function (request, response, next) {

	app.post('/items/image/upload/:id', [middleware.requireAuthentication, uploader.single()], function (request, response) {

		console.log(request);

		var itemID = parseInt(request.params.id, 10);

		var fileName = request.file.originalname

		console.log(fileName);

		db.item.findOne({
			where: {
				id: itemID,
				userId: request.user.get('id')
			}
		}).then(function(item){
		if(item)
		{

			var attributes = {photoLocation: fileName};

			var currentFilePath = __dirname + '/images';
			var projectedFilePath = currentFilePath + '/' + user.username

        	item.update(attributes).then(function(item){

        		fs.ensureDir(filePath, function(err){
	        		if(err) {console.log(err);
	        			response.status(404).json({error: 'error'})
	        		 return;
	        		}

	        		fs.move(currentFilePath + '/' + fileName, projectedFilePath + '/' + fileName, [{clobber: true}], function (err) {
	  					if (err) {return console.error(err);}
	  					console.log("moved file successfully!")

	  					response.status(200).json(item);
					});
        		});
        		
			}, function (e){
				console.log(e)
				response.status(400).json({error: 'An Error has occurred'});
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



app.use(express.static(__dirname + '/public'));

db.sequelize.sync({force: true}).then(function(){

	app.listen(PORT, function(){

		console.log('Express server started on port: ' + PORT + '!');
	});

});