import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.lights}></div>

      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>

        <h2 className={styles.title}>
          Te perdiste en la fiesta...
        </h2>

        <p className={styles.text}>
          Las luces son fuertes, la música retumba y ya no sabes cómo llegaste
          aquí. Esta ruta no existe.
        </p>

        <Link to="/" className={styles.button}>
          Volver a la entrada
        </Link>
      </div>
    </div>
  );
};

export default NotFound;