import styles from "./Detail.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../REDUX/actions";
import toast from "react-hot-toast";
import api from "../../api/api";
import backgroundImage from "../../assets/backgroundImage.jpg";

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState("");

  const isInCart = cartItems.some((item) => item.id === Number(id));

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
    if (isInCart) return;

    if (availableStock <= 0) {
      toast.error("Este producto no tiene stock disponible.");
      return;
    }

    dispatch(addToCart({ ...product, quantity: 1 }));

    toast.success(
      "Producto agregado al carrito. Podrás elegir la cantidad dentro del carrito antes de finalizar la compra.",
      {
        duration: 3500,
      },
    );
  };

  if (loading) return <p>Cargando...</p>;
  if (!product) return <p>Producto no encontrado</p>;

  const {
    title,
    description,
    price,
    stock,
    reservedStock = 0,
    brand,
    colors,
    category,
    imageUrl = [],
  } = product;

  const availableStock = Math.max(0, stock - reservedStock);

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
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

          <p className={styles.brand}>Marca: {brand}</p>

          <p className={styles.description}>{description}</p>

          {colors?.length > 0 && (
            <div>
              <strong>Colores:</strong> {colors.join(", ")}
            </div>
          )}

          <div className={styles.price}>${price}</div>

          {/* 📦 STOCK */}
          <p className={availableStock > 0 ? styles.inStock : styles.outStock}>
            Stock disponible: {availableStock}
          </p>

          {/* 🛒 ACCIONES */}
          <div className={styles.actions}>
            <button
              className={
                isInCart
                  ? styles.inCartBtn
                  : availableStock > 0
                    ? styles.buyBtn
                    : styles.outStockBtn
              }
              onClick={handleAction}
              disabled={isInCart || availableStock <= 0}
            >
              {isInCart
                ? "Producto en carrito"
                : availableStock > 0
                  ? "Agregar al carrito"
                  : "Sin stock disponible"}
            </button>

            <div className={styles.secondaryActions}>
              {isInCart ? (
                <>
                  <button
                    className={styles.backBtn}
                    onClick={() => navigate(-1)}
                  >
                    Volver
                  </button>

                  <button
                    className={styles.viewCartBtn}
                    onClick={() => navigate("/cart")}
                  >
                    Ver carrito
                  </button>
                </>
              ) : (
                <button className={styles.backBtn} onClick={() => navigate(-1)}>
                  Volver
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
