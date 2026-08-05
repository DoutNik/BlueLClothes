const { Op, fn, col, literal } = require("sequelize");
const { Product, User, Order, OrderItem } = require("../DB_config");

const formatLocalDate = (date) => {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Cordoba",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

const getDashboardMetrics = async (req, res) => {
  try {
    const [products, users, published, drafts, paused, orders, revenue] =
      await Promise.all([
        Product.count(),

        User.count(),

        Product.count({
          where: {
            status: "published",
          },
        }),

        Product.count({
          where: {
            status: "draft",
          },
        }),

        Product.count({
          where: {
            isActive: false,
          },
        }),

        Order.count({
          where: {
            status: "approved",
          },
        }),

        Order.sum("total", {
          where: {
            status: "approved",
          },
        }),
      ]);

    res.json({
      products,
      users,
      published,
      drafts,
      paused,
      orders,
      revenue: revenue || 0,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

const getSalesCalendar = async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    const start = new Date(year, month - 1, 1);

    const end = new Date(year, month, 1);

    const orders = await Order.findAll({
      where: {
        status: "approved",

        createdAt: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
      },

      order: [["createdAt", "ASC"]],
    });

    const calendar = {};

    let monthRevenue = 0;

    let monthSales = 0;

    let bestDayRevenue = 0;

    let bestDay = null;

    for (const order of orders) {
      const date = formatLocalDate(order.createdAt);

      if (!calendar[date]) {
        calendar[date] = {
          date,
          sales: 0,
          revenue: 0,
        };
      }

      calendar[date].sales++;

      calendar[date].revenue += order.total;

      monthRevenue += order.total;

      monthSales++;
    }

    Object.values(calendar).forEach((day) => {
      if (day.revenue > bestDayRevenue) {
        bestDayRevenue = day.revenue;
        bestDay = day.date;
      }
    });

    res.json({
      summary: {
        monthSales,

        monthRevenue,

        averageTicket: monthSales === 0 ? 0 : monthRevenue / monthSales,

        bestDay,
      },

      days: Object.values(calendar),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

const getSalesDay = async (req, res) => {
  try {
    const { date } = req.query;

const [year, month, day] = date.split("-").map(Number);

const start = new Date(year, month - 1, day);

const end = new Date(year, month - 1, day + 1);

    const orders = await Order.findAll({
      where: {
        status: "approved",

        createdAt: {
          [Op.gte]: start,

          [Op.lt]: end,
        },
      },

      include: [
        {
          model: OrderItem,
          as: "OrderItems",
        },
      ],

      order: [["createdAt", "ASC"]],
    });

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardMetrics,
  getSalesCalendar,
  getSalesDay,
};
