import styles from "./Detail.module.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/api";

const ProductDetail = () => {
  const { id } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);

        setProduct(res.data);
        setSelectedImg(res.data.imageUrl?.[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAction = () => {
    if (quantity <= stock) {
      console.log("Compra normal:", quantity);
      // 👉 acá iría tu lógica de carrito
    } else {
      console.log("Encargo:", quantity);
      // 👉 acá lógica de preorder
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!product) return <p>Producto no encontrado</p>;

  const {
    title,
    description,
    price,
    stock,
    brand,
    category,
    imageUrl = [],
  } = product;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* 📸 GALERÍA */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img src={selectedImg} alt={title} />
          </div>

          <div className={styles.thumbs}>
            {imageUrl.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="thumb"
                onClick={() => setSelectedImg(img)}
                className={selectedImg === img ? styles.active : ""}
              />
            ))}
          </div>
        </div>

        {/* 🧾 INFO */}
        <div className={styles.info}>
          <h2>{title}</h2>

          <p className={styles.brand}>
            {brand} • {category}
          </p>

          <p className={styles.description}>{description}</p>

          <div className={styles.price}>${price}</div>

          {/* 📦 STOCK */}
          <p className={stock > 0 ? styles.inStock : styles.outStock}>
            Stock disponible: {stock}
          </p>

          {/* 🔢 CANTIDAD */}
          <div className={styles.quantityBox}>
            <label>Cantidad:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
          </div>

          {/* 🛒 ACCIONES */}
          <button className={styles.buyBtn} onClick={handleAction}>
            {quantity <= stock ? "Comprar" : "Encargar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
