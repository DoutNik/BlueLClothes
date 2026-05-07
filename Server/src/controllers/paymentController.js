const mercadopago = require("mercadopago");
const { Order, OrderItem, Product } = require("../DB_config");

const {
  MercadoPagoConfig,
  Preference,
} = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const createPreference = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items?.length) {
      return res.status(400).json({
        error: "No hay productos",
      });
    }

    // 🔥 crear orden pendiente
    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      total,
      status: "pending",
    });

    // 🔥 guardar productos de la orden
    for (const item of items) {
      await OrderItem.create({
        orderId: order.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        productId: item.id,
      });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: Number(item.price),
          currency_id: "ARS",
        })),

        metadata: {
          orderId: order.id,
        },

        back_urls: {
          success: "http://localhost:5173/payment-success",
          failure: "http://localhost:5173/payment-failure",
          pending: "http://localhost:5173/payment-pending",
        },

        auto_return: "approved",
      },
    });

    res.json({
      id: result.id,
      init_point: result.init_point,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error creando preferencia",
    });
  }
};

module.exports = {
  createPreference,
};

exports.webhook = async (req, res) => {
  try {
    const payment = req.body.data;

    if (!payment?.id) return res.sendStatus(200);

    const mpRes = await mercadopago.payment.findById(payment.id);

    const orderId = mpRes.body.external_reference;

    if (!orderId) return res.sendStatus(200);

    const order = await Order.findByPk(orderId, {
      include: OrderItem,
    });

    if (!order) return res.sendStatus(200);

    if (mpRes.body.status === "approved") {
      order.status = "approved";
      order.paymentId = payment.id;
      await order.save();

      // 🔥 descontar stock
      for (let item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};