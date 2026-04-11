import React, { useState } from "react";
import axios from "axios";
import styles from "./CreateProduct.module.css";

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
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>CREATE PRODUCT</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Title"
            className={styles.input}
          />
          <input
            name="brand"
            value={form.brand}
            onChange={handleChange}
            placeholder="Brand"
            className={styles.input}
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Category"
            className={styles.input}
          />
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
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
            placeholder="Image URL"
            className={`${styles.input} ${styles.full}`}
          />

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
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
