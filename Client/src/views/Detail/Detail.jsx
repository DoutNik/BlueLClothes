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
    brand,
    category,
    imageUrl = [],
  } = product;

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

          <div className={styles.price}>${price}</div>

          {/* 📦 STOCK */}
          <p className={stock > 0 ? styles.inStock : styles.outStock}>
            Stock disponible: {stock}
          </p>

          {/* 🛒 ACCIONES */}
          <div className={styles.actions}>
            <button
              className={isInCart ? styles.inCartBtn : styles.buyBtn}
              onClick={handleAction}
              disabled={isInCart}
            >
              {isInCart ? "Producto en carrito" : "Agregar al carrito"}
            </button>

            {isInCart && (
              <button
                className={styles.viewCartBtn}
                onClick={() => navigate("/cart")}
              >
                Ver carrito
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
