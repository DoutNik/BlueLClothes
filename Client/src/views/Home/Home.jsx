import React, { useState } from "react";
import Glasses from "../Glasses/Glasses";
import styles from "./Home.module.css";
import Categories from "../../components/Categories/Categories";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCentered, setIsCentered] = useState(true); // Estado para el centrado

  return (
    <div className={styles.container}>
      {/* Paso Inicial */}
      <Categories>  </Categories>

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
