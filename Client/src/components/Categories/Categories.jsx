import { useState, useEffect } from "react";
import styles from "./Categories.module.css";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCategory } from "../../REDUX/actions";

const Categories = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  const [selectedCategory, setSelectedCategory] = useState("active");
  const [isCentered, setIsCentered] = useState(false);

  const category = useSelector((state) => state.filters.category);

  const handleSelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setIsCentered(false);

    dispatch(setCategory(categoryName));
  };

  useEffect(() => {
    if (location.pathname === "/") {
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
          {/* ACCESORIOS */}
          <button
            className={`${styles.button} ${styles.accsessories} ${styles.disabled}`}
            disabled
          >
            <p>Accesorios</p>

            <div className={styles.overlay}>
              <span>PRÓXIMAMENTE</span>
            </div>
          </button>

          {/* ABANICOS */}
          <button
            className={`${styles.button} ${styles.handfan} ${styles.disabled}`}
            disabled
          >
            <p>Abanicos</p>

            <div className={styles.overlay}>
              <span>PRÓXIMAMENTE</span>
            </div>
          </button>

          {/* ROPA */}
          <button
            className={`${styles.button} ${styles.ropa} ${styles.disabled}`}
            disabled
          >
            <p>Ropa</p>

            <div className={styles.overlay}>
              <span>PRÓXIMAMENTE</span>
            </div>
          </button>

          {/* GAFAS */}
          <button
            className={`${styles.button} ${styles.gafas} ${
              category === "gafas" ? styles.active : ""
            }`}
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