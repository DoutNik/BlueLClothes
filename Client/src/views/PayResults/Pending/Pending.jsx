import { Link } from "react-router-dom";
import styles from "./Pending.module.css";

const PaymentPending = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>⏳</div>

        <h1>Pago pendiente</h1>

        <p>
          Tu pago está siendo procesado por Mercado Pago.
          Apenas sea confirmado, actualizaremos tu pedido.
        </p>

        <div className={styles.actions}>
          <Link
            to="/"
            className={styles.primaryBtn}
          >
            Volver al inicio
          </Link>

          <Link
            to="/cart"
            className={styles.secondaryBtn}
          >
            Ver carrito
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;