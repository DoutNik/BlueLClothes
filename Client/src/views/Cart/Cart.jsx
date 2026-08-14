import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  updateCartStock,
  removeFromCart,
  increaseQty,
  decreaseQty,
  clearCart,
  getProducts,
} from "../../REDUX/actions";
import api from "../../api/api";
import backgroundImage from "../../assets/backgroundImage.jpg";
import styles from "./Cart.module.css";
import Swal from "sweetalert2";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [purchaseError, setPurchaseError] = useState("");
  const [isBuying, setIsBuying] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const items = useSelector((state) => state.cart.items);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  /*
  |--------------------------------------------------------------------------
  | STOCK INICIAL DE LOS ITEMS
  |--------------------------------------------------------------------------
  */

  const [selectedItems, setSelectedItems] = useState(() =>
    Object.fromEntries(
      items.map((item) => [
        item.id,
        (item.availableStock ?? item.stock ?? 0) > 0,
      ]),
    ),
  );

  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR STOCK DISPONIBLE DESDE BACKEND
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const refreshCartStock = async () => {
      if (!items.length) return;

      try {
        const updatedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const res = await api.get(`/products/${item.id}`);

              return {
                ...item,
                stock: res.data.stock,
                reservedStock: res.data.reservedStock,
                availableStock:
                  res.data.availableStock ??
                  Math.max(0, res.data.stock - res.data.reservedStock),
              };
            } catch (error) {
              console.error(
                `Error obteniendo stock del producto ${item.id}:`,
                error,
              );

              return item;
            }
          }),
        );

        dispatch(updateCartStock(updatedItems));
      } catch (error) {
        console.error("Error actualizando stock del carrito:", error);
      }
    };

    refreshCartStock();
  }, [dispatch, items.length]);

  /*
  |--------------------------------------------------------------------------
  | PRODUCTOS SELECCIONADOS PARA COMPRAR
  |--------------------------------------------------------------------------
  */

  const purchasableItems = items.filter((item) => selectedItems[item.id]);

  /*
  |--------------------------------------------------------------------------
  | TOTAL
  |--------------------------------------------------------------------------
  */

  const total = purchasableItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  /*
  |--------------------------------------------------------------------------
  | PRODUCTOS SIN STOCK DISPONIBLE
  |--------------------------------------------------------------------------
  */

  const hasUnavailableProducts = items.some(
    (item) => selectedItems[item.id] && (item.availableStock ?? 0) <= 0,
  );

  /*
  |--------------------------------------------------------------------------
  | CANTIDAD MAYOR AL STOCK DISPONIBLE
  |--------------------------------------------------------------------------
  */

  const hasQuantityProblems = purchasableItems.some(
    (item) => item.availableStock > 0 && item.quantity > item.availableStock,
  );

  /*
  |--------------------------------------------------------------------------
  | SE PUEDE COMPRAR
  |--------------------------------------------------------------------------
  */

  const canBuy =
    purchasableItems.length > 0 &&
    !hasUnavailableProducts &&
    !hasQuantityProblems;

  /*
  |--------------------------------------------------------------------------
  | CREAR PREFERENCIA
  |--------------------------------------------------------------------------
  */

  const handleBuy = async () => {
  setIsBuying(true);

  try {
    const res = await api.post("/payment/create-preference", {
      items: purchasableItems,
    });

    const paymentWindow = window.open(
      res.data.init_point,
      "_blank",
    );

    if (!paymentWindow) {
      await Swal.fire({
        icon: "warning",
        title: "Ventana bloqueada",
        text: "El navegador bloqueó la ventana de Mercado Pago. Permití las ventanas emergentes para continuar.",
        confirmButtonText: "Entendido",
      });
    }
  } catch (error) {
    console.error("Error iniciando pago:", error);

    const message = error.response?.data?.error || "";

    const stockError = message.match(
      /No hay stock suficiente para "(.+)". Disponible: (\d+)/
    );

    if (stockError) {
      const [, productTitle, availableStock] = stockError;

      // Actualizar stock del carrito
      try {
        const updatedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const res = await api.get(
                `/products/${item.id}`,
              );

              return {
                ...item,
                stock: res.data.stock,
                reservedStock: res.data.reservedStock,
                availableStock:
                  res.data.availableStock ??
                  Math.max(
                    0,
                    res.data.stock -
                      res.data.reservedStock,
                  ),
              };
            } catch {
              return item;
            }
          }),
        );

        dispatch(updateCartStock(updatedItems));
      } catch (refreshError) {
        console.error(
          "Error actualizando stock:",
          refreshError,
        );
      }

      if (Number(availableStock) === 0) {
        await Swal.fire({
          icon: "warning",
          title: "Producto sin stock",
          html: `
            <p>
              El producto <strong>"${productTitle}"</strong>
              se quedó sin stock. Se ve que alguien lo compro antes que vos.
            </p>
            <p>
              Actualizamos la disponibilidad de tu carrito.
            </p>
          `,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#3085d6",
        });
      } else {
        await Swal.fire({
          icon: "warning",
          title: "Stock actualizado",
          html: `
            <p>
              La cantidad disponible de
              <strong>"${productTitle}"</strong>
              cambió.
            </p>
            <p>
              Actualmente hay
              <strong>${availableStock}</strong>
              unidad${Number(availableStock) === 1 ? "" : "es"}
              disponible${Number(availableStock) === 1 ? "" : "s"}.
            </p>
          `,
          confirmButtonText: "Entendido",
          confirmButtonColor: "#3085d6",
        });
      }

      return;
    }

    await Swal.fire({
      icon: "error",
      title: "No pudimos iniciar el pago",
      text: "Ocurrió un problema al intentar iniciar el pago. Intentá nuevamente.",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#d33",
    });
  } finally {
    setIsBuying(false);
  }
};
  /*
  |--------------------------------------------------------------------------
  | CARRITO VACÍO
  |--------------------------------------------------------------------------
  */

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <h2>Tu carrito está vacío</h2>
      </div>
    );
  }

  return (
    <div
      className={styles.page}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className={styles.container}>
        <h1>Carrito</h1>

        {items.map((item) => {
          const availableStock = item.availableStock ?? 0;

          return (
            <div className={styles.card} key={item.id}>
              {availableStock <= 0 && (
                <div className={styles.outOfStock}>SIN STOCK</div>
              )}

              <img src={item.imageUrl?.[0] || item.image} alt={item.title} />

              <div className={styles.info}>
                <h3>{item.title}</h3>

                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={selectedItems[item.id] || false}
                    onChange={(e) =>
                      setSelectedItems((prev) => ({
                        ...prev,
                        [item.id]: e.target.checked,
                      }))
                    }
                  />
                  Incluir en la compra
                </label>

                <div className={styles.unitPrice}>
                  Precio unitario: ${item.price}
                </div>

                <div className={styles.stock}>
                  Stock disponible: {availableStock}
                </div>

                {hasQuantityProblems && (
                  <div className={styles.stockWarning}>
                    La cantidad seleccionada supera el stock disponible.
                  </div>
                )}

                <div className={styles.qty}>
                  <button
                    disabled={item.quantity <= 1}
                    onClick={() => dispatch(decreaseQty(item.id))}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    disabled={
                      availableStock <= 0 || item.quantity >= availableStock
                    }
                    onClick={() => dispatch(increaseQty(item.id))}
                  >
                    +
                  </button>
                </div>

                <div className={styles.subtotal}>
                  Subtotal: ${item.price * item.quantity}
                </div>

                <div className={styles.itemActions}>
                  <button
                    className={styles.detailBtn}
                    onClick={() => navigate(`/product-detail/${item.id}`)}
                  >
                    Ver detalle
                  </button>

                  <button
                    className={styles.remove}
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Volver
          </button>

          <h2>Total: ${total}</h2>

          {hasUnavailableProducts && (
            <p className={styles.stockWarning}>
              Hay productos sin stock disponible. Eliminalos del carrito para
              poder continuar con la compra.
            </p>
          )}

          {hasQuantityProblems && (
            <p className={styles.stockWarning}>
              La cantidad de uno o más productos supera el stock disponible.
            </p>
          )}

          <div className={styles.footerActions}>
            <button
              className={styles.buyBtn}
              onClick={handleBuy}
              disabled={!canBuy || isBuying}
            >
              {isBuying ? "Verificando stock..." : "Finalizar Compra"}
            </button>

            <button
              className={styles.clearBtn}
              onClick={() => setShowClearModal(true)}
            >
              Vaciar carrito
            </button>
          </div>
        </div>

        {showClearModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.neonIcon}>🛒</div>

              <h2>Vaciar carrito</h2>

              <p>Todos los productos serán eliminados del carrito.</p>

              <p className={styles.warning}>¿Deseas continuar?</p>

              <div className={styles.modalActions}>
                <button
                  className={styles.confirmBtn}
                  onClick={() => setShowClearModal(false)}
                >
                  Continuar compra
                </button>

                <button
                  className={styles.cancelBtn}
                  onClick={() => {
                    dispatch(clearCart());
                    setShowClearModal(false);
                  }}
                >
                  Descartar productos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
