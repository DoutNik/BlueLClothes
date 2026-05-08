import { Link } from "react-router-dom";
import styles from "./Failed.module.css";

const PaymentFailure = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.errorIcon}>❌</div>

        <h1>Pago rechazado</h1>

        <p>
          No pudimos procesar tu pago.
          Puedes intentarlo nuevamente con otro
          método de pago.
        </p>

        <div className={styles.actions}>
          <Link
            to="/cart"
            className={styles.primaryBtn}
          >
            Intentar nuevamente
          </Link>

          <Link
            to="/"
            className={styles.secondaryBtn}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;