var cryptojs= require('crypto-js');
var fs = require('fs-extra');
module.exports = function(db){

	return {
		requireAuthentication: function(request, response, next){
			var token = request.get('Auth') || '';

			db.token.findOne({
				where:{
					tokenHash: cryptojs.MD5(token).toString()
				}
			}). then(function(tokenInstance){
				if(!tokenInstance)
				{
					throw new Error();
				}
				request.token = tokenInstance;
				return db.user.findByToken(token);
			}).then(function(user){
				request.user = user;
				next();
			}).catch(function(){
				response.sendStatus(401);
			});
		}
		ensureFileDirectory: function(request, response, next){

			var filePath = __dirname + '/images/' + request.user.username

        	fs.ensureDir(filePath, function(err){
        		if(err) {console.log(err);
        			response.status(404).json({error: 'error'})
        		 return;
        		}
        		next();

        	});
		}
		emptyFileDirectory: function(request, response, next){

			if(request.user)
			{
				var filePath = __dirname + '/images/' + request.user.username

				fs.emptyDir(filePath, function(err){

					if(err){ console.log("a problem!"); response.sendStatus(501); return;}
					next();
				})
			}

		}
	}
};