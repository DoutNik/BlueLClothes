const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const { Order, OrderItem, Product } = require("../DB_config");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preference = new Preference(client);
const paymentClient = new Payment(client);

const createPreference = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items?.length) {
      return res.status(400).json({
        error: "No hay productos",
      });
    }

    // 🔥 TOTAL
    const total = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    // 🔥 CREAR ORDEN
    const order = await Order.create({
      total,
      status: "pending",
    });

    // 🔥 ITEMS
    for (const item of items) {
      await OrderItem.create({
        OrderId: order.id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        productId: item.id,
      });
    }

    // 🔥 PREFERENCE
    const result = await preference.create({
      body: {
        items: items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          unit_price: Number(item.price),
          currency_id: "ARS",
        })),

        external_reference: String(order.id),

        back_urls: {
          success:
            "https://draconic-syndetically-kaci.ngrok-free.dev/payment-success",

          failure:
            "https://draconic-syndetically-kaci.ngrok-free.dev/payment-failure",

          pending:
            "https://draconic-syndetically-kaci.ngrok-free.dev/payment-pending",
        },

        auto_return: "approved",

        notification_url:
          "https://draconic-syndetically-kaci.ngrok-free.dev/payment/webhook",
      },
    });

    res.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Error creando preferencia",
    });
  }
};

const webhook = async (req, res) => {
  try {
    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      return res.sendStatus(200);
    }

    // 🔥 BUSCAR PAGO
    const payment = await paymentClient.get({
      id: paymentId,
    });

    const orderId = payment.external_reference;

    if (!orderId) {
      return res.sendStatus(200);
    }

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
        },
      ],
    });

    if (!order) {
      return res.sendStatus(200);
    }

    // 🔥 APROBADO
    if (payment.status === "approved") {
      order.status = "approved";
      order.paymentId = paymentId;

      await order.save();

      // 🔥 DESCONTAR STOCK
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);

        if (product) {
          product.stock -= item.quantity;

          if (product.stock < 0) {
            product.stock = 0;
          }

          await product.save();
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.log(error);

    res.sendStatus(500);
  }
};

module.exports = {
  createPreference,
  webhook,
};
