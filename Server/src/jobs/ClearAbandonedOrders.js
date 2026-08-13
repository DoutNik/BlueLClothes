const { Op } = require("sequelize");
const {
  Order,
  OrderItem,
  Product,
  conn,
} = require("../DB_config");

const clearAbandonedOrders = async (io) => {
  const transaction = await conn.transaction();

  try {
    console.log("=================================");
    console.log("🧹 BUSCANDO ORDENES EXPIRADAS");
    console.log("Ahora:", new Date());
    console.log("=================================");

    const expiredOrders = await Order.findAll({
      where: {
        status: "pending",
        expiresAt: {
          [Op.lte]: new Date(),
        },
      },
      attributes: ["id"],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    console.log(
      `Se encontraron ${expiredOrders.length} órdenes expiradas.`
    );

    for (const expiredOrder of expiredOrders) {
      try {
        // =====================================================
        // 1. OBTENER LA ORDEN BLOQUEADA
        // =====================================================

        const order = await Order.findByPk(expiredOrder.id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!order) {
          console.log(
            `Orden #${expiredOrder.id} no encontrada.`
          );

          continue;
        }

        // Por seguridad, volvemos a comprobar el estado.
        if (order.status !== "pending") {
          console.log(
            `Orden #${order.id} ya no está pendiente. Estado: ${order.status}`
          );

          continue;
        }

        // =====================================================
        // 2. OBTENER LOS ITEMS
        // =====================================================

        const orderItems = await OrderItem.findAll({
          where: {
            OrderId: order.id,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        // =====================================================
        // 3. LIBERAR RESERVAS
        // =====================================================

        for (const item of orderItems) {
          const product = await Product.findByPk(
            item.productId,
            {
              transaction,
              lock: transaction.LOCK.UPDATE,
            }
          );

          if (!product) {
            console.log(
              `Producto ${item.productId} no encontrado.`
            );

            continue;
          }

          const previousReservedStock =
            product.reservedStock;

          product.reservedStock = Math.max(
            0,
            product.reservedStock - item.quantity
          );

          await product.save({
            transaction,
          });

          console.log(
            `Reserva liberada: ${product.title} | ` +
            `${previousReservedStock} → ${product.reservedStock}`
          );

          // ===================================================
          // AVISAR AL FRONTEND
          // ===================================================

          if (io) {
            io.emit("stock_updated", {
              productId: product.id,
              stock: product.stock,
              reservedStock: product.reservedStock,
              availableStock:
                product.stock - product.reservedStock,
            });
          }
        }

        // =====================================================
        // 4. MARCAR ORDEN COMO EXPIRADA
        // =====================================================

        order.status = "expired";

        await order.save({
          transaction,
        });

        console.log(
          `⏰ Orden #${order.id} marcada como expired.`
        );
      } catch (error) {
        console.error(
          `Error procesando orden #${expiredOrder.id}:`
        );

        console.error(error);

        throw error;
      }
    }

    // =========================================================
    // 5. CONFIRMAR TRANSACCIÓN
    // =========================================================

    await transaction.commit();

    console.log("=================================");
    console.log("🧹 LIMPIEZA FINALIZADA");
    console.log("=================================");
  } catch (error) {
    await transaction.rollback();

    console.error(
      "❌ Error limpiando órdenes abandonadas:"
    );

    console.error(error);

    console.log("=================================");
  }
};

module.exports = clearAbandonedOrders;