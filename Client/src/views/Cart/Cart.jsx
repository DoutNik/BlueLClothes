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

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showClearModal, setShowClearModal] = useState(false);

  const items = useSelector((state) => state.cart.items);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const [selectedItems, setSelectedItems] = useState(() =>
    Object.fromEntries(items.map((item) => [item.id, item.stock > 0])),
  );

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

        console.log("Stock actualizado desde backend:", updatedItems);

        dispatch(updateCartStock(updatedItems));
      } catch (error) {
        console.error("Error actualizando stock del carrito:", error);
      }
    };

    refreshCartStock();
  }, [dispatch, items.length]);

  const purchasableItems = items.filter((item) => selectedItems[item.id]);

  const total = purchasableItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const hasUnavailableProducts = items.some(
    (item) => item.stock <= 0 && selectedItems[item.id],
  );

  const canBuy = purchasableItems.length > 0 && !hasUnavailableProducts;

  const handleBuy = async () => {
    try {
      const res = await api.post("/payment/create-preference", {
        items: purchasableItems,
      });

      const paymentWindow = window.open(res.data.init_point, "_blank");

      if (!paymentWindow) {
        alert(
          "El navegador bloqueó la ventana de Mercado Pago. Permití las ventanas emergentes para continuar.",
        );
      }
    } catch (error) {
      console.log(error);
      alert("Error al iniciar pago");
    }
  };

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

        {items.map((item) => (
          <div className={styles.card} key={item.id}>
            {item.stock <= 0 && (
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
              <div className={styles.stock}>Stock disponible: {item.stock}</div>

              <div className={styles.qty}>
                <button
                  disabled={item.stock <= 0}
                  onClick={() => dispatch(decreaseQty(item.id))}
                >
                  -
                </button>

                <span>{item.quantity}</span>

                <button
                  disabled={item.stock <= 0 || item.quantity >= item.stock}
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
        ))}

        <div className={styles.footer}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Volver
          </button>

          <h2>Total: ${total}</h2>
          {hasUnavailableProducts && (
            <p className={styles.stockWarning}>
              Hay productos sin stock. Eliminalos del carrito para poder
              continuar con la compra.
            </p>
          )}
          <div className={styles.footerActions}>
            <button
              className={styles.buyBtn}
              onClick={handleBuy}
              disabled={!canBuy}
            >
              Finalizar Compra
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
