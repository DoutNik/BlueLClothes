import React, { useState } from "react";
import axios from "axios";
import styles from "./CreateProduct.module.css";
import backgroundImage from "../../../assets/adminBackground.jpg";

const CreateProduct = () => {
  const [form, setForm] = useState({
    title: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:3001/products", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("✅ Producto guardado como borrador");
      setForm({
        title: "",
        brand: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
      });
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al crear producto");
    }
  };

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className={styles.overlay} />

      <div className={styles.card}>
        <h2 className={styles.title}>CREAR PRODUCTO</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Nombre del producto"
            className={styles.input}
          />
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Marca"
            className={styles.input}
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="">Seleccionar categoría</option>
            <option value="gafas">Gafas / Lentes</option>
            <option value="ropa">Ropa</option>
            <option value="abanicos">Abanicos</option>
            <option value="accesorios">Accesorios</option>
          </select>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Precio"
            type="number"
            className={styles.input}
          />
          <input
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Stock"
            type="number"
            className={styles.input}
          />

          <input
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="URL de la imagen"
            className={`${styles.input} ${styles.full}`}
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            className={`${styles.input} ${styles.full} ${styles.textarea}`}
          />

          <button type="submit" className={`${styles.button} ${styles.full}`}>
            GUARDAR BORRADOR
          </button>
        </form>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default CreateProduct;
