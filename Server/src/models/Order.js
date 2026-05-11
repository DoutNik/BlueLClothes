const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Order = sequelize.define(
    "Order",
    {
      status: {
        type: DataTypes.ENUM(
          "pending",
          "approved",
          "rejected",
          "cancelled",
          "expired"
        ),

        allowNull: false,

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

      expiresAt: {
        type: DataTypes.DATE,

        allowNull: false,
      },
    },
    {
      paranoid: true,
    }
  );

  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, {
      foreignKey: "OrderId",
      as: "OrderItems",
      onDelete: "CASCADE",
    });
  };

  return Order;
};