import React, { useState } from "react";
import Glasses from "../../components/Glasses/Glasses";
import styles from "./Home.module.css";

const Home = () => {
  // Estado para manejar la selección del usuario
  const [selectedCategory, setSelectedCategory] = useState("");

  // Función para manejar el clic en los botones
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className={styles.container}>
        <h1 className={styles.title}>
            <span className={styles.blurBackground}>¡Bienvenido a BlueGlass!</span>
        </h1>
        <p className={styles.subtitle}>Selecciona una categoría para explorar:</p>

        <div className={styles.buttonContainer}>
            <button
                className={styles.button}
                onClick={() => handleCategoryClick('ropa')}
            >
              <p>Ver Ropa</p>
            </button>
            <button
                className={styles.button}
                onClick={() => handleCategoryClick('gafas')}
            >
              <p>Ver Gafas</p>
            </button>
        </div>

        <div className={styles.content}>
            {selectedCategory === 'ropa' && (
                <p className={styles.text}>
                    Has elegido explorar nuestra colección de ropa. ¡Mira lo último en moda!
                </p>
            )}
            {selectedCategory === 'gafas' && <Glasses />}
            {selectedCategory === '' && (
                <p className={styles.text}>
                    Por favor, selecciona una categoría para comenzar.
                </p>
            )}
        </div>
    </div>
);
};

export default Home;
