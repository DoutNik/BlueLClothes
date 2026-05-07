const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OrderItem = sequelize.define("OrderItem", {
    title: {
      type: DataTypes.STRING,
    },

    price: {
      type: DataTypes.FLOAT,
    },

    quantity: {
      type: DataTypes.INTEGER,
    },

    productId: {
      type: DataTypes.INTEGER,
    },
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: "orderId",
    });
  };

  return OrderItem;
};