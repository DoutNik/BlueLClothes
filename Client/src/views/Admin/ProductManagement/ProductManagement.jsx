import { useEffect, useState, useRef } from "react";
import api from "../../../api/api";
import styles from "./ProductManagement.module.css";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  const readyRef = useRef(null);
  const draftRef = useRef(null);
  const publishedRef = useRef(null);
  const pausedRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products/admin/all");
      setProducts(res.data);
      console.log(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar este producto?",
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      if (product.isActive) {
        await api.put(`/products/${product.id}/suspend`);
      } else {
        await api.put(`/products/${product.id}/activate`);
      }

      fetchProducts();
    } catch (error) {
      alert(
        error.response?.data?.error ||
          "Error al cambiar el estado del producto.",
      );
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/products/${editingProduct.id}`, editingProduct);

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)),
      );

      setEditingProduct(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePublish = async (product) => {
    try {
      await api.put(`/products/${product.id}/publish`);

      fetchProducts();
    } catch (error) {
      console.error("Error al publicar el producto:", error);
    }
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const readyProducts = products.filter((p) => p.status === "ready");

  const draftProducts = products.filter((p) => p.status === "draft");

  const publishedProducts = products.filter(
    (p) => p.status === "published" && p.isActive,
  );

  const pausedProducts = products.filter((p) => !p.isActive);

  const renderProduct = (product) => (
    <div className={styles.card} key={product.id}>
      {product.stock === 0 && (
        <div className={styles.outOfStock}>SIN STOCK</div>
      )}

      <img src={product.imageUrl?.[0]} alt={product.title} />

      <div className={styles.info}>
        <h3>{product.title}</h3>

        <p>{product.brand}</p>

        <span className={styles.price}>${product.price}</span>

        <div className={styles.statusRow}>
          <span className={product.isActive ? styles.active : styles.paused}>
            {product.isActive ? "Activo" : "Pausado"}
          </span>

          <span>Stock: {product.stock}</span>
        </div>

        <div className={styles.actions}>
          {product.status === "ready" && (
            <button
              className={styles.publishBtn}
              onClick={() => handlePublish(product)}
            >
              Publicar
            </button>
          )}

          <button
            className={styles.editBtn}
            onClick={() => setEditingProduct(product)}
          >
            Editar
          </button>

          <button
            className={styles.pauseBtn}
            onClick={() => handleToggleStatus(product)}
            disabled={!product.isActive && product.stock === 0}
          >
            {product.isActive ? "Pausar" : "Activar"}
          </button>

          <button
            className={styles.deleteBtn}
            onClick={() => handleDelete(product.id)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.stickyHeader}>
      <h1 className={styles.title}>Gestión de Productos</h1>

      {/* NAVBAR SECUNDARIA */}
      <div className={styles.subNavbar}>
        <button onClick={() => scrollToSection(readyRef)}>
          ⏳ Esperando validación
          <span>{readyProducts.length}</span>
        </button>

        <button onClick={() => scrollToSection(draftRef)}>
          📝 Borradores
          <span>{draftProducts.length}</span>
        </button>

        <button onClick={() => scrollToSection(publishedRef)}>
          🌎 Publicados
          <span>{publishedProducts.length}</span>
        </button>

        <button onClick={() => scrollToSection(pausedRef)}>
          ⏸️ Pausados
          <span>{pausedProducts.length}</span>
        </button>
      </div>
      </div>

      {/* READY */}
      <section ref={readyRef} className={styles.section}>
        <h2>⏳ Productos esperando validación</h2>

        <div className={styles.grid}>
          {readyProducts.length ? (
            readyProducts.map(renderProduct)
          ) : (
            <p>No hay productos en validación.</p>
          )}
        </div>
      </section>

      {/* DRAFT */}
      <section ref={draftRef} className={styles.section}>
        <h2>📝 Borradores</h2>

        <div className={styles.grid}>
          {draftProducts.length ? (
            draftProducts.map(renderProduct)
          ) : (
            <p>No hay borradores.</p>
          )}
        </div>
      </section>

      {/* PUBLISHED */}
      <section ref={publishedRef} className={styles.section}>
        <h2>🌎 Publicados</h2>

        <div className={styles.grid}>
          {publishedProducts.length ? (
            publishedProducts.map(renderProduct)
          ) : (
            <p>No hay productos publicados.</p>
          )}
        </div>
      </section>

      {/* PAUSED */}
      <section ref={pausedRef} className={styles.section}>
        <h2>⏸️ Pausados</h2>

        <div className={styles.grid}>
          {pausedProducts.length ? (
            pausedProducts.map(renderProduct)
          ) : (
            <p>No hay productos pausados.</p>
          )}
        </div>
      </section>

      {/* MODAL EDIT */}
      {editingProduct && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2>Editar producto</h2>

            <div className={styles.field}>
              <label>Título</label>
              <input
                type="text"
                value={editingProduct.title}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Marca</label>
              <input
                type="text"
                value={editingProduct.brand}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    brand: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Precio</label>
              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    price: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Stock</label>
              <input
                type="number"
                value={editingProduct.stock}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    stock: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className={styles.field}>
              <label>Descripción</label>
              <textarea
                value={editingProduct.description}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.saveBtn} onClick={handleSave}>
                Guardar
              </button>

              <button
                className={styles.cancelBtn}
                onClick={() => setEditingProduct(null)}
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
