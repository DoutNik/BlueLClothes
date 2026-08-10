const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const { Order, OrderItem, Product } = require("../DB_config");

const sendNotification = require("../utils/SendNotification");

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
          success: "http://localhost:5173/payment-success",

          failure: "http://localhost:5173/payment-failure",

          pending: "http://localhost:5173/payment-pending",
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

    /*
    |--------------------------------------------------------------------------
    | 1. IDENTIFICAR EL TIPO DE EVENTO
    |--------------------------------------------------------------------------
    |
    | Mercado Pago puede enviar:
    | - payment
    | - merchant_order
    | - otros eventos
    |
    | Para nuestro sistema solamente necesitamos procesar "payment",
    | porque desde el pago obtenemos:
    | - payment.id
    | - payment.status
    | - payment.external_reference
    |
    */

    const eventType = req.body?.type;

    if (eventType !== "payment") {
      console.log("Evento ignorado:", eventType);
      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | 2. OBTENER PAYMENT ID
    |--------------------------------------------------------------------------
    */

    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      console.log("No llegó paymentId");
      return res.sendStatus(200);
    }

    console.log("Payment ID:", paymentId);

    /*
    |--------------------------------------------------------------------------
    | 3. CONSULTAR EL PAGO DIRECTAMENTE A MERCADO PAGO
    |--------------------------------------------------------------------------
    |
    | No confiamos únicamente en lo que viene en el webhook.
    | Consultamos la API de Mercado Pago para obtener el estado real.
    |
    */

    const paymentResponse = await paymentClient.get({
      id: paymentId,
    });

    const payment = paymentResponse.body || paymentResponse;

    console.log("Respuesta de Mercado Pago:");
    console.log(JSON.stringify(payment, null, 2));

    console.log("Status:", payment.status);
    console.log("External Reference:", payment.external_reference);

    /*
    |--------------------------------------------------------------------------
    | 4. OBTENER ID DE NUESTRA ORDEN
    |--------------------------------------------------------------------------
    */

    const orderId = payment.external_reference;

    if (!orderId) {
      console.log("El pago no tiene external_reference");
      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | 5. BUSCAR ORDEN
    |--------------------------------------------------------------------------
    */

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
      `Orden encontrada #${order.id} - Estado actual: ${order.status}`,
    );

    /*
    |--------------------------------------------------------------------------
    | 6. EVITAR PROCESAR DOS VECES LA MISMA ORDEN
    |--------------------------------------------------------------------------
    |
    | Mercado Pago puede enviar el mismo webhook varias veces.
    |
    | Si la orden ya está aprobada, no debemos:
    | - descontar stock nuevamente
    | - enviar nuevamente notificaciones
    |
    */

    if (order.status === "approved") {
      console.log("La orden ya estaba aprobada. Evento ignorado.");
      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | 7. SI LA ORDEN ESTÁ EXPIRADA
    |--------------------------------------------------------------------------
    |
    | No permitimos aprobar una orden que nuestro sistema ya marcó
    | como abandonada/expirada.
    |
    */

    if (order.status === "expired") {
      console.log(
        `La orden #${order.id} está expirada. No se procesará el pago.`,
      );

      return res.sendStatus(200);
    }

    /*
    |--------------------------------------------------------------------------
    | 8. PAGO APROBADO
    |--------------------------------------------------------------------------
    */

    if (payment.status === "approved") {
      console.log("=================================");
      console.log("PAGO APROBADO");
      console.log("=================================");

      /*
      |--------------------------------------------------------------------------
      | Actualizar orden
      |--------------------------------------------------------------------------
      */

      order.status = "approved";
      order.paymentId = String(payment.id);

      await order.save();

      console.log("Orden actualizada correctamente.");

      /*
      |--------------------------------------------------------------------------
      | NOTIFICACIÓN AL ADMIN
      |--------------------------------------------------------------------------
      */

      try {
        await sendNotification({
          io: req.io,
          roleTarget: "admin",
          title: "Nueva venta",
          message: `Nueva compra #${order.id} por $${order.total}`,
          type: "sale",
        });

        console.log("Notificación de venta enviada al admin.");
      } catch (error) {
        console.log("Error enviando notificación al admin:");
        console.log(error);
      }

      /*
      |--------------------------------------------------------------------------
      | NOTIFICACIÓN AL USUARIO
      |--------------------------------------------------------------------------
      */

      if (order.userId) {
        try {
          await sendNotification({
            io: req.io,
            userId: order.userId,
            title: "Pago aprobado",
            message: `Tu pedido #${order.id} fue aprobado.`,
            type: "success",
          });

          console.log("Notificación de pago enviada al usuario.");
        } catch (error) {
          console.log("Error enviando notificación al usuario:");
          console.log(error);
        }
      }

      /*
      |--------------------------------------------------------------------------
      | 9. DESCONTAR STOCK
      |--------------------------------------------------------------------------
      */

      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);

        if (!product) {
          console.log(`Producto ${item.productId} no encontrado. Se continúa.`);

          continue;
        }

        /*
        |--------------------------------------------------------------------------
        | Descontar stock
        |--------------------------------------------------------------------------
        */

        const previousStock = product.stock;

        product.stock = Math.max(0, product.stock - item.quantity);

        await product.save();

        req.io.emit("stock_updated", {
          productId: product.id,
          stock: product.stock,
        });

        console.log(
          `Stock actualizado: ${product.title} | ${previousStock} → ${product.stock}`,
        );

        /*
        |--------------------------------------------------------------------------
        | STOCK BAJO
        |--------------------------------------------------------------------------
        */

        if (product.stock > 0 && product.stock <= 3) {
          try {
            await sendNotification({
              io: req.io,
              roleTarget: "admin",
              title: "Stock bajo",
              message: `${product.title} tiene solo ${product.stock} unidades disponibles.`,
              type: "warning",
            });

            console.log(`Notificación de stock bajo enviada: ${product.title}`);
          } catch (error) {
            console.log("Error enviando notificación de stock bajo:");
            console.log(error);
          }
        }

        /*
        |--------------------------------------------------------------------------
        | PRODUCTO AGOTADO
        |--------------------------------------------------------------------------
        */

        if (product.stock === 0) {
          try {
            /*
            | Si el producto queda sin stock,
            | lo pausamos automáticamente.
            */

            product.isActive = false;
            product.status = "paused";

            await product.save();

            console.log(
              `Producto pausado automáticamente por falta de stock: ${product.title}`,
            );

            await sendNotification({
              io: req.io,
              roleTarget: "admin",
              title: "Producto agotado",
              message: `${product.title} se quedó sin stock y fue pausado automáticamente.`,
              type: "error",
            });

            console.log(
              `Notificación de producto agotado enviada: ${product.title}`,
            );
          } catch (error) {
            console.log("Error procesando producto agotado:");
            console.log(error);
          }
        }
      }

      console.log("=================================");
      console.log("Webhook procesado correctamente.");
      console.log("=================================");
    } else if (payment.status === "rejected") {

    /*
    |--------------------------------------------------------------------------
    | 10. PAGO RECHAZADO
    |--------------------------------------------------------------------------
    */
      console.log("Pago rechazado.");

      order.status = "rejected";

      await order.save();

      /*
      |--------------------------------------------------------------------------
      | Notificación admin
      |--------------------------------------------------------------------------
      */

      try {
        await sendNotification({
          io: req.io,
          roleTarget: "admin",
          title: "Pago rechazado",
          message: `Pedido #${order.id} rechazado.`,
          type: "error",
        });

        console.log("Notificación de pago rechazado enviada al admin.");
      } catch (error) {
        console.log("Error enviando notificación de pago rechazado al admin:");
        console.log(error);
      }

      /*
      |--------------------------------------------------------------------------
      | Notificación usuario
      |--------------------------------------------------------------------------
      */

      if (order.userId) {
        try {
          await sendNotification({
            io: req.io,
            userId: order.userId,
            title: "Pago rechazado",
            message: `Tu pago del pedido #${order.id} fue rechazado.`,
            type: "error",
          });

          console.log("Notificación de pago rechazado enviada al usuario.");
        } catch (error) {
          console.log(
            "Error enviando notificación de pago rechazado al usuario:",
          );
          console.log(error);
        }
      }
    } else {

    /*
    |--------------------------------------------------------------------------
    | 11. OTROS ESTADOS
    |--------------------------------------------------------------------------
    |
    | pending
    | in_process
    | cancelled
    | etc.
    |
    | No modificamos nuestra orden todavía.
    |
    */
      console.log(`Estado de pago no procesado: ${payment.status}`);
    }

    console.log("========== FIN WEBHOOK ==========");

    return res.sendStatus(200);
  } catch (error) {
    console.log("========== ERROR EN WEBHOOK ==========");
    console.log(error);

    if (error.response) {
      console.log("Respuesta del servidor:");
      console.log(error.response);
    }

    console.log("======================================");

    return res.sendStatus(500);
  }
};

module.exports = {
  createPreference,
  webhook,
};
