import React, { useState } from "react";
import styles from "./Home.module.css";
import Categories from "../../components/Categories/Categories";
import backgroundImage from "../../assets/backgroundImage.jpg";

const Home = () => {

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Paso Inicial */}
      <Categories> </Categories>
    </div>
  );
};

export default Home;
