import React, { useState, useEffect } from "react";
import styles from "./Categories.module.css";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Categories = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCentered, setIsCentered] = useState(true); // Estado para el centrado

  const handleSelect = (category) => {
    setSelectedCategory(category);
    setIsCentered(false);
  };

  useEffect(() => {
    if (location.pathname !== "/") {
      setIsCentered(false);
      setSelectedCategory("active");
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
          <Link className="nav-link" to="/clothes">
            <button
              className={`${styles.button} ${styles.ropa}`}
              onClick={() => handleSelect("clothes")}
            >
              <p>Ropa</p>
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
