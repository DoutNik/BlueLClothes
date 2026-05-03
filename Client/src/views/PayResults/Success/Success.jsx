import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "../REDUX/actions";
import styles from "./Success.module.css";

const Success = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        <h2>🎉 Gracias por tu compra</h2>
        <p>Tu pedido fue procesado correctamente</p>
      </div>
    </div>
  );
};

export default Success;