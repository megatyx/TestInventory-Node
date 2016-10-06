module.exports = function(db){

	return {
		requireAuthentication: function(request, response, next){
			var token = request.get('Auth');

			db.user.findByToken(token).then(function(user){
				request.user = user;
				next();
			}, function(){
				console.log('middleware something went wrong')
				response.sendStatus(401);
			});
		}
	}
};

// var middleware = {

// 	requireAuthentication: function(request, response, next){

// 		console.log('private route hit!');
// 		next();
// 	},
// 	logger: function(request, response, next){

// 		console.log('Request: ' + new Date().toString() + ' ' + request.method + ' ' + request.originalUrl);
// 		next();
// 	}

// };

// module.exports = middleware;