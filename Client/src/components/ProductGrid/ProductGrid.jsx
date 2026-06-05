import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import styles from "./ProductGrid.module.css";

const ProductGrid = () => {
  const { allProducts, loading, error } = useSelector(
    (state) => state.products,
  );

  const search = useSelector(
    (state) => state.search?.search || "",
  );

  const [searchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category");

  const formatImage = (url) => {
    if (!url) return "https://via.placeholder.com/500";

    return url.replace(
      "/upload/",
      "/upload/w_500,h_500,c_fill,g_auto/",
    );
  };

  if (loading) return <p>Cargando...</p>;

  if (error) return <p>{error}</p>;

  // No mostrar productos hasta elegir categoría
  if (!selectedCategory) {
    return null;
  }

  const filteredProducts = allProducts.filter((product) => {
    const matchCategory =
      product.category?.toLowerCase() ===
      selectedCategory.toLowerCase();

    const value = search.toLowerCase();

    const matchSearch =
      !value ||
      product.title?.toLowerCase().includes(value) ||
      product.brand?.toLowerCase().includes(value) ||
      product.category?.toLowerCase().includes(value);

    return matchCategory && matchSearch;
  });

  return (
    <div className={styles.grid}>
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <Link
            key={product.id}
            to={`/product-detail/${product.id}`}
            className={styles.link}
          >
            <div className={styles.cardWrapper}>
              <div className={styles.cardPro}>
                <img
                  src={formatImage(
                    product.imageUrl?.[0] || product.image,
                  )}
                  alt={product.title}
                  className={styles.image}
                />

                <div className={styles.overlay} />

                <div className={styles.price}>
                  ${product.price}
                </div>

                <div className={styles.content}>
                  <h5>{product.title}</h5>

                  <p>
                    {product.description || product.desc}
                  </p>

                  <p className={styles.extra}>
                    Marca: {product.brand}
                  </p>

                  <p className={styles.extra}>
                    Stock: {product.stock}
                  </p>
                </div>

                <div className={styles.tag}>
                  {product.title}
                </div>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className={styles.empty}>
          No se encontraron productos
        </div>
      )}
    </div>
  );
};

export default ProductGrid;