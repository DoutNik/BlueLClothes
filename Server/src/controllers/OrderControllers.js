const { Order, OrderItem } = require("../DB_config");

exports.getOrders = async (req, res) => {
const orders = await Order.findAll({
  include: [
    {
      model: OrderItem,
      as: "OrderItems",
    },
  ],
  order: [["createdAt", "DESC"]],
});

  res.json(orders);
};