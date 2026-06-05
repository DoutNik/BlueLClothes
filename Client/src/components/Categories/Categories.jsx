import { useState, useEffect } from "react";
import styles from "./Categories.module.css";
import { useLocation, useNavigate } from "react-router-dom";

const Categories = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCentered, setIsCentered] = useState(false);

  const handleSelect = (category) => {
    setSelectedCategory(category);
    setIsCentered(false);

    navigate(`/?category=${category}`);
  };

  useEffect(() => {
    if (location.pathname === "/" && !location.search) {
      setIsCentered(true);
      setSelectedCategory("");
    }
  }, [location]);

  return (
    <div className={styles.container}>
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

        <div className={styles.buttonContainer}>
          <button
            className={`${styles.button} ${styles.accsessories} ${styles.disabled}`}
            disabled
          >
            <p>Accesorios</p>

            <div className={styles.overlay}>
              <span>PRÓXIMAMENTE</span>
            </div>
          </button>

          <button
            className={`${styles.button} ${styles.handfan} ${styles.disabled}`}
            disabled
          >
            <p>Abanicos</p>

            <div className={styles.overlay}>
              <span>PRÓXIMAMENTE</span>
            </div>
          </button>

          <button
            className={`${styles.button} ${styles.ropa} ${styles.disabled}`}
            disabled
          >
            <p>Ropa</p>

            <div className={styles.overlay}>
              <span>PRÓXIMAMENTE</span>
            </div>
          </button>

          <button
            className={`${styles.button} ${styles.gafas}`}
            onClick={() => handleSelect("gafas")}
          >
            <p>Gafas</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Categories;