const mercadopago = require("mercadopago");
const { Order, OrderItem, Product } = require("../models");

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
});

exports.createPreference = async (req, res) => {
  try {
    const { items } = req.body;

    // 🔒 recalcular precios desde DB (seguridad)
    let total = 0;

    const order = await Order.create({
      status: "pending",
      total: 0,
    });

    const mpItems = [];

    for (let item of items) {
      const product = await Product.findByPk(item.id);

      if (!product) continue;

      total += product.price * item.quantity;

      await OrderItem.create({
        orderId: order.id,
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: item.quantity,
      });

      mpItems.push({
        title: product.title,
        quantity: item.quantity,
        unit_price: Number(product.price),
        currency_id: "ARS",
      });
    }

    order.total = total;
    await order.save();

    const preference = {
      items: mpItems,
      external_reference: String(order.id),

      back_urls: {
        success: `${process.env.FRONT_URL}/success`,
        failure: `${process.env.FRONT_URL}/failure`,
        pending: `${process.env.FRONT_URL}/pending`,
      },

      auto_return: "approved",
      notification_url: `${process.env.BACK_URL}/payment/webhook`,
    };

    const response = await mercadopago.preferences.create(preference);

    res.json({
      init_point: response.body.init_point,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error creando pago" });
  }
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