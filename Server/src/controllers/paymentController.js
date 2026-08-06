const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const { Order, OrderItem, Product } = require("../DB_config");

const { sendNotification } = require("../utils/SendNotification");


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
    const expirationDate = new Date(Date.now() + 1000 * 60 * 30);

    const order = await Order.create({
      total,
      status: "pending",
      expiresAt: expirationDate,
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
            "http://localhost:5173/payment-success",

          failure:
            "http://localhost:5173/payment-failure",

          pending:
            "http://localhost:5173/payment-pending",
        },

        //auto_return: "approved",

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
  console.error("ERROR CREATE PREFERENCE");
  console.error(error);

  if (error.response) {
    console.error(error.response.data);
  }

  res.status(500).json({
    error: error.message,
  });
}
};

const webhook = async (req, res) => {
  try {
    console.log("========== WEBHOOK ==========");
    console.log("Body recibido:");
    console.log(JSON.stringify(req.body, null, 2));

    // Mercado Pago puede enviar distintos tipos de eventos.
    if (req.body.type !== "payment") {
      console.log("Evento ignorado:", req.body.type);
      return res.sendStatus(200);
    }

    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      console.log("No llegó paymentId");
      return res.sendStatus(200);
    }

    console.log("Payment ID:", paymentId);

    // Buscar el pago en Mercado Pago
    const paymentResponse = await paymentClient.get({
      id: paymentId,
    });

    console.log("Respuesta de Mercado Pago:");
    console.log(JSON.stringify(paymentResponse, null, 2));

    // Compatible con distintas versiones del SDK
    const payment = paymentResponse.body || paymentResponse;

    console.log("Status:", payment.status);
    console.log("External Reference:", payment.external_reference);

    const orderId = payment.external_reference;

    if (!orderId) {
      console.log("El pago no tiene external_reference");
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
      console.log("No se encontró la orden:", orderId);
      return res.sendStatus(200);
    }

    console.log(
      `Orden encontrada #${order.id} - Estado actual: ${order.status}`
    );

    if (order.status === "expired") {
      console.log("La orden está expirada");
      return res.sendStatus(200);
    }

    if (order.status === "approved") {
      console.log("La orden ya estaba aprobada");
      return res.sendStatus(200);
    }

    // ===========================
    // PAGO APROBADO
    // ===========================
    if (payment.status === "approved") {
      console.log("Aprobando orden...");

      order.status = "approved";
      order.paymentId = String(payment.id);

      await order.save();

      console.log("Orden actualizada correctamente.");

      try {
        await sendNotification({
          io: req.io,
          roleTarget: "admin",
          title: "Nueva venta",
          message: `Nueva compra #${order.id} por $${order.total}`,
          type: "sale",
        });
      } catch (e) {
        console.log("Error enviando notificación admin");
        console.log(e);
      }

      if (order.userId) {
        try {
          await sendNotification({
            io: req.io,
            userId: order.userId,
            title: "Pago aprobado",
            message: `Tu pedido #${order.id} fue aprobado`,
            type: "success",
          });
        } catch (e) {
          console.log("Error enviando notificación usuario");
          console.log(e);
        }
      }

      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);

        if (!product) continue;

        product.stock -= item.quantity;

        if (product.stock < 0) {
          product.stock = 0;
        }

        await product.save();

        if (product.stock <= 3 && product.stock > 0) {
          try {
            await sendNotification({
              io: req.io,
              roleTarget: "admin",
              title: "Stock bajo",
              message: `${product.title} tiene poco stock`,
              type: "warning",
            });
          } catch (e) {
            console.log(e);
          }
        }

        if (product.stock === 0) {
          try {
            product.status = "paused";
            await product.save();
            await sendNotification({
              io: req.io,
              roleTarget: "admin",
              title: "Producto agotado",
              message: `${product.title} se quedó sin stock y fue pausado`,
              type: "error",
            });
          } catch (e) {
            console.log(e);
          }
        }
      }

      console.log("Webhook procesado correctamente.");
    }

    // ===========================
    // PAGO RECHAZADO
    // ===========================
    if (payment.status === "rejected") {
      console.log("Pago rechazado");

      order.status = "rejected";

      await order.save();

      try {
        await sendNotification({
          io: req.io,
          roleTarget: "admin",
          title: "Pago rechazado",
          message: `Pedido #${order.id} rechazado`,
          type: "error",
        });
      } catch (e) {
        console.log(e);
      }

      if (order.userId) {
        try {
          await sendNotification({
            io,
            userId: order.userId,
            title: "Pago rechazado",
            message: "Tu pago fue rechazado",
            type: "error",
          });
        } catch (e) {
          console.log(e);
        }
      }
    }

    console.log("========== FIN WEBHOOK ==========");

    return res.sendStatus(200);
  } catch (error) {
    console.log("ERROR EN WEBHOOK");
    console.log(error);

    if (error.response) {
      console.log(error.response);
    }

    return res.sendStatus(500);
  }
};

module.exports = {
  createPreference,
  webhook,
};
