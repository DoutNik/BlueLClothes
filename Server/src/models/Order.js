module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    status: {
      type: DataTypes.STRING,
      defaultValue: "pending",
    },
    total: DataTypes.FLOAT,
    paymentId: DataTypes.STRING,
  });

  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, { foreignKey: "orderId" });
  };

  return Order;
};