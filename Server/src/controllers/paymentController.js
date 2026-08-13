const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const { Order, OrderItem, Product } = require("../DB_config");

const sendNotification = require("../utils/SendNotification");

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const preference = new Preference(client);
const paymentClient = new Payment(client);

const createPreference = async (req, res) => {
  // La transacción se crea después, pero la declaramos
  // para poder hacer rollback en cualquier punto.
  let transaction;

  try {
    const { items } = req.body;

    // ============================================================
    // 1. VALIDAR CARRITO
    // ============================================================

    if (!items?.length) {
      return res.status(400).json({
        error: "No hay productos",
      });
    }

    // Validación básica de cantidades e IDs
    for (const item of items) {
      if (!item.id || !Number.isInteger(Number(item.quantity))) {
        return res.status(400).json({
          error: "Producto o cantidad inválida",
        });
      }

      if (Number(item.quantity) <= 0) {
        return res.status(400).json({
          error: "La cantidad debe ser mayor a 0",
        });
      }
    }

    // ============================================================
    // 2. INICIAR TRANSACCIÓN
    // ============================================================

    transaction = await Order.sequelize.transaction();

    // ============================================================
    // 3. ORDENAR LOS PRODUCTOS
    // ============================================================
    //
    // Esto ayuda a evitar deadlocks cuando dos usuarios compran
    // varios productos al mismo tiempo.
    //
    // Ejemplo:
    // Usuario A: producto 1 + producto 2
    // Usuario B: producto 2 + producto 1
    //
    // Ambos los procesarán siempre en el mismo orden.
    // ============================================================

    const sortedItems = [...items].sort(
      (a, b) => Number(a.id) - Number(b.id)
    );

    // ============================================================
    // 4. OBTENER PRODUCTOS CON LOCK
    // ============================================================
    //
    // IMPORTANTE:
    // No confiamos en el precio enviado por el frontend.
    // El precio verdadero sale de nuestra base de datos.
    //
    // FOR UPDATE bloquea las filas hasta que termine la
    // transacción.
    // ============================================================

    const products = {};

    for (const item of sortedItems) {
      const productId = Number(item.id);

      const product = await Product.findByPk(productId, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!product) {
        throw new Error(
          `El producto ${productId} no existe`
        );
      }

      // Si el producto está inactivo no permitimos comprarlo
      if (!product.isActive) {
        throw new Error(
          `El producto "${product.title}" no está disponible`
        );
      }

      products[productId] = product;
    }

    // ============================================================
    // 5. COMPROBAR Y RESERVAR STOCK
    // ============================================================
    //
    // Stock real:
    //
    // stock = cantidad física disponible
    //
    // reservedStock = cantidad actualmente reservada
    //
    // disponible = stock - reservedStock
    //
    // Ejemplo:
    //
    // stock = 10
    // reservedStock = 7
    //
    // disponible = 3
    //
    // Si alguien compra 4 -> ERROR
    // ============================================================

    let total = 0;

    for (const item of sortedItems) {
      const product = products[Number(item.id)];

      const quantity = Number(item.quantity);

      const currentReservedStock =
        Number(product.reservedStock) || 0;

      const availableStock =
        Number(product.stock) - currentReservedStock;

      if (quantity > availableStock) {
        throw new Error(
          `No hay stock suficiente para "${product.title}". ` +
            `Disponible: ${availableStock}`
        );
      }

      // ==========================================================
      // RESERVAR
      // ==========================================================

      product.reservedStock =
        currentReservedStock + quantity;

      await product.save({
        transaction,
      });

      // ==========================================================
      // CALCULAR TOTAL CON PRECIO DE LA BASE DE DATOS
      // ==========================================================

      total += Number(product.price) * quantity;
    }

    // ============================================================
    // 6. CREAR ORDEN
    // ============================================================

    const expirationDate = new Date(
      Date.now() + 1000 * 60 * 30
    );

    const orderData = {
      total,
      status: "pending",
      expiresAt: expirationDate,
    };

    // Si posteriormente agregamos userId al modelo Order,
    // esto permitirá asociar la orden automáticamente.
    if (req.user?.id) {
      orderData.userId = req.user.id;
    }

    const order = await Order.create(orderData, {
      transaction,
    });

    // ============================================================
    // 7. CREAR ORDER ITEMS
    // ============================================================

    for (const item of sortedItems) {
      const product = products[Number(item.id)];

      await OrderItem.create(
        {
          OrderId: order.id,
          title: product.title,
          quantity: Number(item.quantity),
          price: Number(product.price),
          productId: product.id,
        },
        {
          transaction,
        }
      );
    }

    // ============================================================
    // 8. CREAR PREFERENCE DE MERCADO PAGO
    // ============================================================
    //
    // IMPORTANTE:
    // También usamos los precios de nuestra DB.
    // Nunca los del frontend.
    // ============================================================

    const preferenceItems = sortedItems.map((item) => {
      const product = products[Number(item.id)];

      return {
        title: product.title,
        quantity: Number(item.quantity),
        unit_price: Number(product.price),
        currency_id: "ARS",
      };
    });

    const result = await preference.create({
      body: {
        items: preferenceItems,

        external_reference: String(order.id),

        back_urls: {
          success:
            "http://localhost:5173/payment-success",

          failure:
            "http://localhost:5173/payment-failure",

          pending:
            "http://localhost:5173/payment-pending",
        },

        // Podés activarlo después si querés que Mercado Pago
        // redirija automáticamente al volver del pago.
        // auto_return: "approved",

        notification_url:
          "https://draconic-syndetically-kaci.ngrok-free.dev/payment/webhook",
      },
    });

    // ============================================================
    // 9. CONFIRMAR TRANSACCIÓN
    // ============================================================
    //
    // Hasta este punto:
    //
    // - stock NO bajó
    // - reservedStock aumentó
    // - Order = pending
    // - OrderItems creados
    // - Preference creada
    //
    // Ahora confirmamos todo.
    // ============================================================

    await transaction.commit();

    transaction = null;

    console.log("=================================");
    console.log("ORDEN CREADA Y STOCK RESERVADO");
    console.log("Orden:", order.id);
    console.log("Total:", total);
    console.log("Expira:", expirationDate);
    console.log("=================================");

    return res.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point,
      orderId: order.id,
    });
  } catch (error) {
    // ============================================================
    // 10. ROLLBACK
    // ============================================================
    //
    // Si cualquier cosa falla:
    //
    // - no queda la Order
    // - no quedan OrderItems
    // - se libera reservedStock
    //
    // Esto es fundamental para no dejar stock bloqueado.
    // ============================================================

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(
          "Error haciendo rollback:",
          rollbackError
        );
      }
    }

    console.error("=================================");
    console.error("ERROR CREATE PREFERENCE");
    console.error(error);
    console.error("=================================");

    if (error.response) {
      console.error(
        "Respuesta Mercado Pago:",
        error.response.data
      );
    }

    return res.status(400).json({
      error: error.message || "Error creando preferencia",
    });
  }
};

const webhook = async (req, res) => {
  let transaction;

  try {
    console.log("========== WEBHOOK ==========");
    console.log("Body recibido:");
    console.log(JSON.stringify(req.body, null, 2));

    // ============================================================
    // 1. IDENTIFICAR TIPO DE EVENTO
    // ============================================================

    const eventType = req.body?.type;

    if (eventType !== "payment") {
      console.log("Evento ignorado:", eventType);
      return res.sendStatus(200);
    }

    // ============================================================
    // 2. OBTENER PAYMENT ID
    // ============================================================

    const paymentId = req.body?.data?.id;

    if (!paymentId) {
      console.log("No llegó paymentId");
      return res.sendStatus(200);
    }

    console.log("Payment ID:", paymentId);

    // ============================================================
    // 3. CONSULTAR PAGO REAL A MERCADO PAGO
    // ============================================================

    const paymentResponse = await paymentClient.get({
      id: paymentId,
    });

    const payment = paymentResponse.body || paymentResponse;

    console.log("Respuesta de Mercado Pago:");
    console.log(JSON.stringify(payment, null, 2));

    console.log("Status:", payment.status);
    console.log(
      "External Reference:",
      payment.external_reference
    );

    // ============================================================
    // 4. OBTENER ID DE LA ORDEN
    // ============================================================

    const orderId = payment.external_reference;

    if (!orderId) {
      console.log(
        "El pago no tiene external_reference"
      );

      return res.sendStatus(200);
    }

    // ============================================================
    // 5. INICIAR TRANSACCIÓN
    // ============================================================

    transaction = await Order.sequelize.transaction();

    // ============================================================
    // 6. BUSCAR ORDEN CON LOCK
    // ============================================================
    //
    // El lock evita que dos webhooks intenten procesar
    // simultáneamente la misma orden.
    // ============================================================

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: "OrderItems",
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      console.log(
        "No se encontró la orden:",
        orderId
      );

      await transaction.rollback();
      transaction = null;

      return res.sendStatus(200);
    }

    console.log(
      `Orden encontrada #${order.id} - Estado actual: ${order.status}`
    );

    // ============================================================
    // 7. EVITAR DUPLICADOS
    // ============================================================
    //
    // Mercado Pago puede mandar el mismo webhook varias veces.
    //
    // Si ya fue aprobada:
    // NO volvemos a descontar stock.
    //
    // Si ya fue rechazada/cancelada:
    // NO volvemos a liberar reservedStock.
    // ============================================================

    if (
      order.status === "approved" ||
      order.status === "rejected" ||
      order.status === "cancelled" ||
      order.status === "expired"
    ) {
      console.log(
        `Orden #${order.id} ya fue procesada con estado: ${order.status}`
      );

      await transaction.rollback();
      transaction = null;

      return res.sendStatus(200);
    }

    // ============================================================
    // 8. VERIFICAR MONTO DEL PAGO
    // ============================================================
    //
    // Nunca confiamos en el total enviado por frontend.
    //
    // La orden tiene su total y Mercado Pago tiene
    // transaction_amount.
    //
    // Si no coinciden, no procesamos la venta.
    // ============================================================

    if (
      payment.transaction_amount !== undefined &&
      Number(payment.transaction_amount) !==
        Number(order.total)
    ) {
      console.log("=================================");
      console.log("ERROR: MONTO NO COINCIDE");
      console.log("Orden:", order.total);
      console.log(
        "Mercado Pago:",
        payment.transaction_amount
      );
      console.log("=================================");

      await transaction.rollback();
      transaction = null;

      return res.sendStatus(200);
    }

    // ============================================================
    // 9. PAGO APROBADO
    // ============================================================

    if (payment.status === "approved") {
      console.log("=================================");
      console.log("PAGO APROBADO");
      console.log("=================================");

      // ==========================================================
      // 9.1 PROCESAR CADA PRODUCTO
      // ==========================================================

      for (const item of order.OrderItems) {
        const product = await Product.findByPk(
          item.productId,
          {
            transaction,
            lock: transaction.LOCK.UPDATE,
          }
        );

        if (!product) {
          throw new Error(
            `Producto ${item.productId} no encontrado`
          );
        }

        const quantity = Number(item.quantity);

        const previousStock = Number(product.stock);
        const previousReserved =
          Number(product.reservedStock) || 0;

        // ========================================================
        // VALIDAR RESERVA
        // ========================================================
        //
        // La cantidad comprada debería estar reservada.
        //
        // Si no existe suficiente reservedStock significa que
        // hay un problema de integridad y NO debemos confirmar
        // parcialmente la venta.
        // ========================================================

        if (previousReserved < quantity) {
          throw new Error(
            `Reserva insuficiente para "${product.title}". ` +
              `Reservado: ${previousReserved}, ` +
              `necesario: ${quantity}`
          );
        }

        // ========================================================
        // CONVERTIR RESERVA EN VENTA
        // ========================================================
        //
        // Antes:
        //
        // stock = 10
        // reservedStock = 3
        //
        // Después:
        //
        // stock = 7
        // reservedStock = 0
        // ========================================================

        product.stock =
          previousStock - quantity;

        product.reservedStock =
          previousReserved - quantity;

        await product.save({
          transaction,
        });

        console.log(
          `Venta confirmada: ${product.title} | ` +
            `stock ${previousStock} → ${product.stock} | ` +
            `reservado ${previousReserved} → ${product.reservedStock}`
        );
      }

      // ==========================================================
      // 9.2 ACTUALIZAR ORDEN
      // ==========================================================

      order.status = "approved";
      order.paymentId = String(payment.id);

      await order.save({
        transaction,
      });

      // ==========================================================
      // 9.3 CONFIRMAR TRANSACCIÓN
      // ==========================================================

      await transaction.commit();
      transaction = null;

      console.log(
        `Orden #${order.id} aprobada correctamente.`
      );

      // ==========================================================
      // 9.4 ACTUALIZAR FRONTEND EN TIEMPO REAL
      // ==========================================================

      for (const item of order.OrderItems) {
        const product = await Product.findByPk(
          item.productId
        );

        if (product && req.io) {
          req.io.emit("stock_updated", {
            productId: product.id,
            stock: product.stock,
            reservedStock: product.reservedStock,
          });
        }
      }

      // ==========================================================
      // 9.5 NOTIFICACIÓN ADMIN
      // ==========================================================

      try {
        await sendNotification({
          io: req.io,
          roleTarget: "admin",
          title: "Nueva venta",
          message: `Nueva compra #${order.id} por $${order.total}`,
          type: "sale",
        });

        console.log(
          "Notificación de venta enviada al admin."
        );
      } catch (error) {
        console.log(
          "Error enviando notificación al admin:"
        );
        console.log(error);
      }

      // ==========================================================
      // 9.6 NOTIFICACIÓN USUARIO
      // ==========================================================

      if (order.userId) {
        try {
          await sendNotification({
            io: req.io,
            userId: order.userId,
            title: "Pago aprobado",
            message: `Tu pedido #${order.id} fue aprobado.`,
            type: "success",
          });

          console.log(
            "Notificación de pago enviada al usuario."
          );
        } catch (error) {
          console.log(
            "Error enviando notificación al usuario:"
          );
          console.log(error);
        }
      }

      // ==========================================================
      // 9.7 STOCK BAJO / AGOTADO
      // ==========================================================

      for (const item of order.OrderItems) {
        const product = await Product.findByPk(
          item.productId
        );

        if (!product) {
          continue;
        }

        // --------------------------------------------------------
        // STOCK BAJO
        // --------------------------------------------------------

        if (
          product.stock > 0 &&
          product.stock <= 3
        ) {
          try {
            await sendNotification({
              io: req.io,
              roleTarget: "admin",
              title: "Stock bajo",
              message:
                `${product.title} tiene solo ` +
                `${product.stock} unidades disponibles.`,
              type: "warning",
            });

            console.log(
              `Notificación de stock bajo enviada: ${product.title}`
            );
          } catch (error) {
            console.log(
              "Error enviando notificación de stock bajo:"
            );
            console.log(error);
          }
        }

        // --------------------------------------------------------
        // PRODUCTO AGOTADO
        // --------------------------------------------------------

        if (product.stock === 0) {
          try {
            product.isActive = false;
            product.status = "paused";

            await product.save();

            console.log(
              `Producto pausado automáticamente por falta de stock: ${product.title}`
            );

            await sendNotification({
              io: req.io,
              roleTarget: "admin",
              title: "Producto agotado",
              message:
                `${product.title} se quedó sin stock ` +
                `y fue pausado automáticamente.`,
              type: "error",
            });

            console.log(
              `Notificación de producto agotado enviada: ${product.title}`
            );
          } catch (error) {
            console.log(
              "Error procesando producto agotado:"
            );
            console.log(error);
          }
        }
      }

      console.log("=================================");
      console.log("Webhook procesado correctamente.");
      console.log("=================================");

      return res.sendStatus(200);
    }

    // ============================================================
    // 10. PAGO RECHAZADO
    // ============================================================

    if (payment.status === "rejected") {
      console.log("=================================");
      console.log("PAGO RECHAZADO");
      console.log("=================================");

      // ----------------------------------------------------------
      // Liberar reserva
      // ----------------------------------------------------------

      for (const item of order.OrderItems) {
        const product = await Product.findByPk(
          item.productId,
          {
            transaction,
            lock: transaction.LOCK.UPDATE,
          }
        );

        if (!product) {
          throw new Error(
            `Producto ${item.productId} no encontrado`
          );
        }

        const quantity = Number(item.quantity);

        const previousReserved =
          Number(product.reservedStock) || 0;

        if (previousReserved < quantity) {
          throw new Error(
            `Reserva insuficiente para liberar ` +
              `"${product.title}".`
          );
        }

        product.reservedStock =
          previousReserved - quantity;

        await product.save({
          transaction,
        });

        console.log(
          `Reserva liberada: ${product.title} | ` +
            `${previousReserved} → ${product.reservedStock}`
        );
      }

      // ----------------------------------------------------------
      // Actualizar orden
      // ----------------------------------------------------------

      order.status = "rejected";
      order.paymentId = String(payment.id);

      await order.save({
        transaction,
      });

      // ----------------------------------------------------------
      // Confirmar transacción
      // ----------------------------------------------------------

      await transaction.commit();
      transaction = null;

      console.log(
        `Orden #${order.id} marcada como rechazada.`
      );

      // ----------------------------------------------------------
      // Actualizar frontend
      // ----------------------------------------------------------

      for (const item of order.OrderItems) {
        const product = await Product.findByPk(
          item.productId
        );

        if (product && req.io) {
          req.io.emit("stock_updated", {
            productId: product.id,
            stock: product.stock,
            reservedStock: product.reservedStock,
          });
        }
      }

      // ----------------------------------------------------------
      // Notificación admin
      // ----------------------------------------------------------

      try {
        await sendNotification({
          io: req.io,
          roleTarget: "admin",
          title: "Pago rechazado",
          message: `Pedido #${order.id} rechazado.`,
          type: "error",
        });

        console.log(
          "Notificación de pago rechazado enviada al admin."
        );
      } catch (error) {
        console.log(
          "Error enviando notificación de pago rechazado al admin:"
        );
        console.log(error);
      }

      // ----------------------------------------------------------
      // Notificación usuario
      // ----------------------------------------------------------

      if (order.userId) {
        try {
          await sendNotification({
            io: req.io,
            userId: order.userId,
            title: "Pago rechazado",
            message:
              `Tu pago del pedido #${order.id} fue rechazado.`,
            type: "error",
          });

          console.log(
            "Notificación de pago rechazada enviada al usuario."
          );
        } catch (error) {
          console.log(
            "Error enviando notificación al usuario:"
          );
          console.log(error);
        }
      }

      return res.sendStatus(200);
    }

    // ============================================================
    // 11. PAGO CANCELADO
    // ============================================================
    //
    // Lo tratamos igual que un rechazo:
    // liberar la reserva.
    // ============================================================

    if (payment.status === "cancelled") {
      console.log("=================================");
      console.log("PAGO CANCELADO");
      console.log("=================================");

      for (const item of order.OrderItems) {
        const product = await Product.findByPk(
          item.productId,
          {
            transaction,
            lock: transaction.LOCK.UPDATE,
          }
        );

        if (!product) {
          throw new Error(
            `Producto ${item.productId} no encontrado`
          );
        }

        const quantity = Number(item.quantity);

        const previousReserved =
          Number(product.reservedStock) || 0;

        if (previousReserved < quantity) {
          throw new Error(
            `Reserva insuficiente para liberar ` +
              `"${product.title}".`
          );
        }

        product.reservedStock =
          previousReserved - quantity;

        await product.save({
          transaction,
        });

        console.log(
          `Reserva liberada: ${product.title} | ` +
            `${previousReserved} → ${product.reservedStock}`
        );
      }

      order.status = "cancelled";
      order.paymentId = String(payment.id);

      await order.save({
        transaction,
      });

      await transaction.commit();
      transaction = null;

      console.log(
        `Orden #${order.id} marcada como cancelada.`
      );

      // Actualizar frontend
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(
          item.productId
        );

        if (product && req.io) {
          req.io.emit("stock_updated", {
            productId: product.id,
            stock: product.stock,
            reservedStock: product.reservedStock,
          });
        }
      }

      return res.sendStatus(200);
    }

    // ============================================================
    // 12. OTROS ESTADOS
    // ============================================================
    //
    // pending
    // in_process
    // authorized
    // etc.
    //
    // NO tocamos la reserva.
    // La orden continúa pendiente.
    // ============================================================

    console.log(
      `Estado de pago no procesado: ${payment.status}`
    );

    await transaction.rollback();
    transaction = null;

    console.log("========== FIN WEBHOOK ==========");

    return res.sendStatus(200);
  } catch (error) {
    console.log(
      "========== ERROR EN WEBHOOK =========="
    );

    console.log(error);

    if (error.response) {
      console.log(
        "Respuesta del servidor:"
      );

      console.log(error.response);
    }

    // ============================================================
    // ROLLBACK
    // ============================================================

    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error(
          "Error haciendo rollback:",
          rollbackError
        );
      }
    }

    console.log(
      "======================================"
    );

    return res.sendStatus(500);
  }
};

module.exports = {
  createPreference,
  webhook,
};