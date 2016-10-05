var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes){

	var user = sequelize.define('user', {

		email:{
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},

		salt: {
			type: DataTypes.STRING
		},

		password_hash: { 
			type: DataTypes.STRING
		},

		password:{
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [7,100]
			},
			set: function(value){
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	},
	{
		hooks: {

			beforeValidate: function(user, options){

				if(typeof user.email === 'string')
				{
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject){
					var where = {email: body.email};
					if(typeof body.email !== 'string' || typeof body.password !== 'string')
					{
						console.log('rejected based on no valid email or password');
						return reject();
					}

					user.findOne({where: where}).then(function(user){
						if(!user || !bcrypt.compareSync(body.password, user.get('password_hash'))){
							console.log('user object null compareSync not working');
							return reject();
						}
						console.log('login accepted');
						resolve(user);
					}, function(e){
						console.log(e);
						reject();
					});
				});
			},
			findByToken: function (token) {
				return new Promise(function(resolve, reject){
					try{
						var decodedJWT = jwt.verify(token, 'querty098');
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

						user.findById(tokenData.id).then(function(user) {
							if(user)
							{
								resolve(user);
							}
							else {
								reject();
							}

						}, function (e){
							console.log(e);
							reject();
						});
					} catch (e) {
						console.log(e);
						reject();
					}
				});
			}
		},
		instanceMethods: {
			toPublicJSON: function (){
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
			},
			generateToken: function(type){
				if(!_.isString(type))
				{
					console.log('not a string');
					return undefined;
				}

				try {
					var stringData = JSON.stringify({id: this.get('id'), type: type});
					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123').toString();
					var token = jwt.sign({
						token: encryptedData
					}, 'querty098');

					console.log('returning token');

					return token;

				} catch (e){
					console.log(e);
					return undefined;
				}
			}
		}
	});
	return user;

};