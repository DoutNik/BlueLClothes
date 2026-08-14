import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import styles from "./ProductGrid.module.css";

const ProductGrid = () => {
  const { allProducts, loading, error } = useSelector(
    (state) => state.products,
  );

  const search = useSelector((state) => state.search?.search || "");

  const filters = useSelector((state) => state.filters);

  const [searchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category");

  const formatImage = (url) => {
    if (!url) {
      return "https://via.placeholder.com/500";
    }

    return url.replace("/upload/", "/upload/w_500,h_500,c_fill,g_auto/");
  };

  if (loading) return <p>Cargando...</p>;

  if (error) return <p>{error}</p>;

  // No mostrar productos hasta elegir categoría
  if (!selectedCategory) {
    return null;
  }

  const filteredProducts = allProducts
    .filter((product) => {
      // Categoría
      const matchCategory =
        product.category?.toLowerCase() === selectedCategory.toLowerCase();

      // Search
      const value = search.toLowerCase();

      const matchSearch =
        !value ||
        product.title?.toLowerCase().includes(value) ||
        product.brand?.toLowerCase().includes(value) ||
        product.category?.toLowerCase().includes(value) ||
        product.description?.toLowerCase().includes(value);

      // Marca
      const matchBrand =
        !filters.brand ||
        product.brand?.toLowerCase().includes(filters.brand.toLowerCase());

      // Color
      const matchColor =
        !filters.color ||
        product.colors?.some((color) =>
          color.toLowerCase().includes(filters.color.toLowerCase()),
        );

      // Stock disponible
      const availableStock = Math.max(
        0,
        product.stock - (product.reservedStock || 0),
      );

      const matchStock = !filters.inStockOnly || availableStock > 0;

      // Precio mínimo
      const matchMinPrice =
        !filters.minPrice || product.price >= filters.minPrice;

      // Precio máximo
      const matchMaxPrice =
        !filters.maxPrice || product.price <= filters.maxPrice;

      return (
        matchCategory &&
        matchSearch &&
        matchBrand &&
        matchColor &&
        matchStock &&
        matchMinPrice &&
        matchMaxPrice
      );
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case "price-asc":
          return a.price - b.price;

        case "price-desc":
          return b.price - a.price;

        case "name-asc":
          return a.title.localeCompare(b.title);

        case "name-desc":
          return b.title.localeCompare(a.title);

        case "stock-desc":
          return (
            Math.max(0, b.stock - (b.reservedStock || 0)) -
            Math.max(0, a.stock - (a.reservedStock || 0))
          );

        default:
          return 0;
      }
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
                  src={formatImage(product.imageUrl?.[0] || product.image)}
                  alt={product.title}
                  className={styles.image}
                />

                <div className={styles.overlay} />

                <div className={styles.price}>${product.price}</div>

                <div className={styles.content}>
                  <h5>{product.title}</h5>

                  <p>{product.description || product.desc}</p>

                  <p className={styles.extra}>Marca: {product.brand}</p>

                  <p className={styles.extra}>
                    Stock disponible:{" "}
                    {Math.max(0, product.stock - (product.reservedStock || 0))}
                  </p>

                  {product.colors?.length > 0 && (
                    <p className={styles.extra}>
                      Colores: {product.colors.join(", ")}
                    </p>
                  )}
                </div>

                <div className={styles.tag}>{product.title}</div>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className={styles.empty}>No se encontraron productos</div>
      )}
    </div>
  );
};

export default ProductGrid;
