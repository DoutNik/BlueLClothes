const { Order } = require("../DB_config");

exports.getOrders = async (req, res) => {
  const orders = await Order.findAll({
    include: OrderItem,
    order: [["createdAt", "DESC"]],
  });

  res.json(orders);
};