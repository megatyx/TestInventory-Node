

var middleware = {

	requireAuthentication: function(request, response, next){

		console.log('private route hit!');
		next();
	},
	logger: function(request, response, next){

		console.log('Request: ' + new Date().toString() + ' ' + request.method + ' ' + request.originalUrl);
		next();
	}

};

module.exports = middleware;