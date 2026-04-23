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
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

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

    setErrors((prev) => ({
      ...prev,
      images: "",
    }));
  };

  useEffect(() => {
    return () => {
      if (Array.isArray(previews)) {
        previews.forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, [previews]);

  const handleRemoveImage = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);

    if (newFiles.length === 0) {
      const input = document.getElementById("fileInput");
      if (input) input.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "El título es obligatorio";
    if (!form.price || Number(form.price) <= 0)
      newErrors.price = "Precio inválido";
    if (!form.category) newErrors.category = "Selecciona una categoría";
    if (files.length === 0) newErrors.images = "Sube al menos una imagen";

    return newErrors;
  };

  const uploadImages = async () => {
    const uploadedUrls = [];

    for (let file of files) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("category", form.category);

      const res = await api.post("/upload", formData);
      uploadedUrls.push(res.data.imageUrl);
    }

    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage("❌ Corrige los errores");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const imageUrls = await uploadImages();

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
      setErrors({});
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
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.overlay} />

      <div className={styles.card}>
        <h2 className={styles.title}>CREAR PRODUCTO</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.field}>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Nombre del producto"
              className={`${styles.input} ${errors.title ? styles.errorInput : ""}`}
            />
            <p className={styles.errorText}>{errors.title || "\u00A0"}</p>
          </div>

          <div className={styles.field}>
            <input
              name="brand"
              value={form.brand}
              onChange={handleChange}
              placeholder="Marca"
              className={styles.input}
            />
            <p className={styles.errorText}>{"\u00A0"}</p>
          </div>

          <div className={styles.field}>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`${styles.select} ${errors.category ? styles.errorInput : ""}`}
            >
              <option value="">Seleccionar categoría</option>
              <option value="gafas">Gafas / Lentes</option>
              <option value="ropa">Ropa</option>
              <option value="abanicos">Abanicos</option>
              <option value="accesorios">Accesorios</option>
            </select>
            <p className={styles.errorText}>{errors.category || "\u00A0"}</p>
          </div>

          <div className={styles.field}>
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Precio"
              type="number"
              className={`${styles.input} ${errors.price ? styles.errorInput : ""}`}
            />
            <p className={styles.errorText}>{errors.price || "\u00A0"}</p>
          </div>

          <div className={styles.field}>
            <input
              name="stock"
              value={form.stock}
              onChange={handleChange}
              placeholder="Stock"
              type="number"
              className={styles.input}
            />
            <p className={styles.errorText}>{"\u00A0"}</p>
          </div>

          <div className={`${styles.full} ${styles.field}`}>
            <div className={styles.fileWrapper}>
              <label className={styles.fileLabel}>
                {files.length > 0 ? "Agregar más imágenes" : "Subir imágenes"}
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
                  {files.length} imagen(es)
                </span>
              )}
            </div>
            <p className={styles.errorText}>{errors.images || "\u00A0"}</p>
          </div>

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

          <div className={`${styles.full} ${styles.field}`}>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción"
              className={`${styles.input} ${styles.textarea}`}
            />
            <p className={styles.errorText}>{"\u00A0"}</p>
          </div>

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