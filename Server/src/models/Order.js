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
          "expired",
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

      // Usuario que realizó la compra
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
      },

      // Momento en el que vence la reserva
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    },
  );

  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, {
      foreignKey: "OrderId",
      as: "OrderItems",
      onDelete: "CASCADE",
    });

    Order.belongsTo(models.User, {
      foreignKey: "userId",
       as: "User",
    });
  };

  return Order;
};
