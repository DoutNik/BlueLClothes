import React, { useState } from "react";
import Glasses from "../../components/Glasses/Glasses";
import styles from "./Home.module.css";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCentered, setIsCentered] = useState(true); // Estado para el centrado

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setIsCentered(false); // El contenedor deja de estar centrado
  };

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
        <p className={styles.subtitle}>
          Selecciona una categoría para explorar:
        </p>
        {/* Botones de Selección */}
        <div className={styles.buttonContainer}>
          <button
            className={styles.button}
            onClick={() => handleCategoryClick("ropa")}
          >
            <p>Ver Ropa</p>
          </button>
          <button
            className={styles.button}
            onClick={() => handleCategoryClick("gafas")}
          >
            <p>Ver Gafas</p>
          </button>
        </div>
      </div>

      {/* Contenido Dinámico */}
      <div className={styles.content}>
        {selectedCategory === "ropa" && (
          <p className={styles.text}>
            Has elegido explorar nuestra colección de ropa. ¡Mira lo último en
            moda!
          </p>
        )}
        {selectedCategory === "gafas" && <Glasses />}
      </div>
    </div>
  );
};

export default Home;
