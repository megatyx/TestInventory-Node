module.exports = function(sequelize, DataTypes){

	return sequelize.define('item', {


		barcode: {
			type: DataTypes.STRING,
			allowNull: false
		},

		name: {
			type: DataTypes.STRING,
			allowNull: false
		},

		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		},

		description: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [1,250]
			}
		},

		price: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: 0
		},

		photoLocation: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [1,250]
			}
		}
	});


}