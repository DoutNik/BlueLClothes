import { useEffect, useState } from "react";
import api from "../../../api/api";
import styles from "./ProductManagement.module.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/admin/all");
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este producto?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);

      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const updated = {
        ...product,
        isActive: !product.isActive,
      };

      await api.put(`/products/${product.id}`, updated);

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? updated : p
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(
        `/products/${editingProduct.id}`,
        editingProduct
      );

      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? editingProduct
            : p
        )
      );

      setEditingProduct(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Gestión de Productos
      </h1>

      <div className={styles.grid}>
        {products.map((product) => (
          <div
            className={styles.card}
            key={product.id}
          >
            <img
              src={product.imageUrl?.[0]}
              alt={product.title}
            />

            <div className={styles.info}>
              <h3>{product.title}</h3>

              <p>{product.brand}</p>

              <span className={styles.price}>
                ${product.price}
              </span>

              <div className={styles.statusRow}>
                <span
                  className={
                    product.isActive
                      ? styles.active
                      : styles.paused
                  }
                >
                  {product.isActive
                    ? "Activo"
                    : "Pausado"}
                </span>

                <span>
                  Stock: {product.stock}
                </span>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.editBtn}
                  onClick={() =>
                    setEditingProduct(product)
                  }
                >
                  Editar
                </button>

                <button
                  className={styles.pauseBtn}
                  onClick={() =>
                    handleToggleStatus(product)
                  }
                >
                  {product.isActive
                    ? "Pausar"
                    : "Activar"}
                </button>

                <button
                  className={styles.deleteBtn}
                  onClick={() =>
                    handleDelete(product.id)
                  }
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDIT */}
      {editingProduct && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Editar producto</h2>

            <input
              type="text"
              value={editingProduct.title}
              placeholder="Título"
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  title: e.target.value,
                })
              }
            />

            <input
              type="text"
              value={editingProduct.brand}
              placeholder="Marca"
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  brand: e.target.value,
                })
              }
            />

            <input
              type="number"
              value={editingProduct.price}
              placeholder="Precio"
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  price: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              value={editingProduct.stock}
              placeholder="Stock"
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  stock: Number(e.target.value),
                })
              }
            />

            <textarea
              value={editingProduct.description}
              placeholder="Descripción"
              onChange={(e) =>
                setEditingProduct({
                  ...editingProduct,
                  description: e.target.value,
                })
              }
            />

            <div className={styles.modalActions}>
              <button
                className={styles.saveBtn}
                onClick={handleSave}
              >
                Guardar
              </button>

              <button
                className={styles.cancelBtn}
                onClick={() =>
                  setEditingProduct(null)
                }
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;