const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    sequelize.define("Compra", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        unit_price: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        }, 
        productImage: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userDireccion: {
            type: DataTypes.JSON,
        }, 
    });
};
