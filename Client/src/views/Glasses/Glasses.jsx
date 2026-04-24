import styles from "./Glasses.module.css";
import Categories from "../../components/Categories/Categories";
import backgroundImage from "../../assets/backgroundImage.jpg";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../REDUX/actions";
import { filterByCategory } from "../../utils/filterProducts";
import { Link } from "react-router-dom";

const Glasses = () => {
  const dispatch = useDispatch();

  // ✅ selector correcto (profesional)
  const { allProducts, loading, error } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // 🛡️ defensivo (por si algo falla)
  const glasses = filterByCategory(allProducts || [], "gafas");

  const formatImage = (url) => {
    if (!url) return "https://via.placeholder.com/500";

    return url.replace("/upload/", "/upload/w_500,h_500,c_fill,g_auto/");
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <Categories />

      {loading && <p>Cargando...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {glasses.length > 0 ? (
            glasses.map((g, i) => (
              <Link
                key={g.id}
                to={`/product-detail/${g.id}`}
                className={styles.link}
              >
                <div className={styles.cardWrapper}>
                  <div className={styles.cardPro}>
                    <img
                      src={formatImage(g.imageUrl?.[0] || g.image)}
                      alt={g.title}
                      className={styles.image}
                    />

                    <div className={styles.overlay} />

                    <div className={styles.price}>${g.price}</div>

                    <div className={styles.content}>
                      <h5>{g.title}</h5>
                      <p>{g.description || g.desc}</p>

                      <p className={styles.extra}>Marca: {g.brand}</p>

                      <p className={styles.extra}>Stock: {g.stock}</p>

                      {/* 👇 YA NO ES BUTTON */}
                      <span className={styles.button}>Ver más</span>
                    </div>

                    <div className={styles.tag}>{g.title}</div>
                  </div>
                </div>
              </Link>
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
