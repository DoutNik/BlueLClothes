import { useState, useEffect } from "react";
import styles from "./Categories.module.css";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Categories = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("active");
  const [isCentered, setIsCentered] = useState(false); // Estado para el centrado

  const handleSelect = (category) => {
    setSelectedCategory(category);
    setIsCentered(false);
  };

  useEffect(() => {
    if (location.pathname === "/") {
      setIsCentered(true);
      setSelectedCategory("");
    }
  }, [location]);

  return (
    <div className={styles.container}>
      {/* Paso Inicial */}
      <div
        className={
          isCentered ? styles.containerCentered : styles.containerScrolling
        }
      >
        <h1 className={selectedCategory ? styles.titleHidden : styles.title}>
          <span className={styles.blurBackground}>
            ¡Bienvenido a BlueGlass!
          </span>
        </h1>
        {/* Botones de Selección */}
        <div className={styles.buttonContainer}>
          <Link className="nav-link" to="/accessories">
            <button
              className={`${styles.button} ${styles.accsessories} ${styles.disabled}`}
              disabled
            >
              <p>Accesorios</p>

              <div className={styles.overlay}>
                <span>PRÓXIMAMENTE</span>
              </div>
            </button>
          </Link>

          <Link className="nav-link" to="/handfan">
            <button
              className={`${styles.button} ${styles.handfan} ${styles.disabled}`}
              disabled
            >
              <p>Abanicos</p>

              <div className={styles.overlay}>
                <span>PRÓXIMAMENTE</span>
              </div>
            </button>
          </Link>

          <Link className="nav-link" to="/clothes">
            <button
              className={`${styles.button} ${styles.ropa} ${styles.disabled}`}
              disabled
            >
              <p>Ropa</p>

              <div className={styles.overlay}>
                <span>PRÓXIMAMENTE</span>
              </div>
            </button>
          </Link>

          <Link className="nav-link" to="/glasses">
            <button
              className={`${styles.button} ${styles.gafas}`}
              onClick={() => handleSelect("glasses")}
            >
              <p>Gafas</p>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Categories;
