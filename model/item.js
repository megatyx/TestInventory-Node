module.exports = function(sequelize, DataTypes){

	return sequelize.define('item', {


		barcodeNumber: {
			type: DataTypes.STRING,
			allowNull: false
		}

		itemName: {
			type: DataTypes.STRING,
			allowNull: false
		}

		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0
		}

		description: {
			type: DataTypes.STRING,
			allowNull: true,
			validate: {
				len: [1,250]
			}
		}
	});


}