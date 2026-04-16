import styles from "./Glasses.module.css";
import Categories from "../../components/Categories/Categories";
import backgroundImage from "../../assets/backgroundImage.jpg";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../REDUX/actions";
import { filterByCategory } from "../../utils/filterProducts";

const Glasses = () => {
  const dispatch = useDispatch();

  // ✅ selector correcto (profesional)
  const { allProducts, loading, error } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // 🛡️ defensivo (por si algo falla)
  const glasses = filterByCategory(allProducts || [], "gafas");

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <Categories />

      <h2 className={styles.title}>Colección de Gafas</h2>

      {loading && <p>Cargando...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {glasses.length > 0 ? (
            glasses.map((g, i) => (
              <div key={i} className={styles.cardWrapper}>
                <div className={styles.cardPro}>
                  <img
                    src={
                      g.imageUrl?.[0] ||
                      g.image ||
                      "https://via.placeholder.com/500"
                    }
                    alt={g.title}
                    className={styles.image}
                  />

                  <div className={styles.overlay} />

                  <div className={styles.content}>
                    <h5>{g.title}</h5>
                    <p>{g.description || g.desc}</p>
                    <button className={styles.button}>
                      Ver más
                    </button>
                  </div>

                  <div className={styles.tag}>{g.title}</div>
                </div>
              </div>
            ))
          ) : (
            <p>No hay productos disponibles</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Glasses;