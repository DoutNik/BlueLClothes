import React, { useState, useEffect } from "react";
import api from "../../../api/api";
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

  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // 📸 manejar múltiples imágenes (sin duplicados)
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    const filtered = selectedFiles.filter(
      (file) => !files.some((f) => f.name === file.name)
    );

    setFiles((prev) => [...prev, ...filtered]);

    const newPreviews = filtered.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  // 🧹 limpiar memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // ❌ eliminar imagen individual
  const handleRemoveImage = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);

    // reset input si no quedan imágenes
    if (newFiles.length === 0) {
      const input = document.getElementById("fileInput");
      if (input) input.value = "";
    }
  };

  // ☁️ subir múltiples imágenes
  const uploadImages = async () => {
    const uploadedUrls = [];

    for (let file of files) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", form.category);

      const res = await api.post(
        "/upload",
        formData
      );

      uploadedUrls.push(res.data.imageUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      let imageUrls = [];

      if (files.length > 0) {
        imageUrls = await uploadImages();
      }

      await api.post(
        "/products",
        { ...form, imageUrl: imageUrls },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Producto creado correctamente");

      setForm({
        title: "",
        brand: "",
        category: "",
        description: "",
        price: "",
        stock: "",
        imageUrl: "",
      });

      setFiles([]);
      setPreviews([]);
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al crear producto");
    } finally {
      setLoading(false);
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

          {/* 📸 INPUT FILE */}
          <div className={`${styles.full} ${styles.fileWrapper}`}>
            <label className={styles.fileLabel}>
              {files.length > 0
                ? "Agregar más imágenes"
                : "Subir imágenes"}
              <input
                id="fileInput"
                type="file"
                multiple
                onChange={handleFileChange}
                className={styles.fileInput}
              />
            </label>

            {files.length > 0 && (
              <span className={styles.fileName}>
                {files.length} imagen(es) seleccionada(s)
              </span>
            )}
          </div>

          {/* 🔥 PREVIEW GRID */}
          {previews.length > 0 && (
            <div className={styles.previewGrid}>
              {previews.map((img, index) => (
                <div key={index} className={styles.previewItem}>
                  <img src={img} alt="preview" />

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className={styles.removeButton}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            className={`${styles.input} ${styles.full} ${styles.textarea}`}
          />

          <button
            type="submit"
            className={`${styles.button} ${styles.full}`}
            disabled={loading}
          >
            {loading ? "SUBIENDO..." : "GUARDAR BORRADOR"}
          </button>
        </form>

        {message && <p className={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

export default CreateProduct;