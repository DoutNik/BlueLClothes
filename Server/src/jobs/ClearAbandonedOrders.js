const { Op } = require("sequelize");
const { Order } = require("../DB_config");

const clearAbandonedOrders = async () => {
  try {
await Order.update(
  {
    status: "expired",
  },
  {
    where: {
      status: "pending",
      createdAt: {
        [Op.lt]: new Date(
          Date.now() - 1000 * 60 * 30
        ),
      },
    },
  }
);

    console.log(
      "🧹 Ordenes abandonadas eliminadas"
    );
  } catch (error) {
    console.log(error);
  }
};

module.exports = clearAbandonedOrders;