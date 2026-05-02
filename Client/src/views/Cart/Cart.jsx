import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  increaseQty,
  decreaseQty,
  clearCart,
} from "../../REDUX/actions";
import backgroundImage from "../../assets/backgroundImage.jpg";
import styles from "./Cart.module.css";

const Cart = () => {
  const dispatch = useDispatch();

  const items = useSelector((state) => state.cart.items);

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

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
            <img src={item.imageUrl?.[0] || item.image} alt={item.title} />

            <div className={styles.info}>
              <h3>{item.title}</h3>
              <p>${item.price}</p>

              <div className={styles.qty}>
                <button onClick={() => dispatch(decreaseQty(item.id))}>
                  -
                </button>

                <span>{item.quantity}</span>

                <button onClick={() => dispatch(increaseQty(item.id))}>
                  +
                </button>
              </div>

              <button
                className={styles.remove}
                onClick={() => dispatch(removeFromCart(item.id))}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}

        <div className={styles.footer}>
          <h2>Total: ${total}</h2>

          <button onClick={() => dispatch(clearCart())}>Vaciar carrito</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
