const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define("Order", {
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },

    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },

    paymentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return Order;
};