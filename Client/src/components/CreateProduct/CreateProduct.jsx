import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import style from "./CreateProduct.module.css";
import Swal from "sweetalert2";
import Spinner from "../Spinner/Spinner";
import { validateProductForm } from "./validations";
import { uploadFile } from "../../components/Firebase/config";


const CreateProduct = () => {


    const [newProduct, setNewProduct] = useState({
        title: "",
        marcaChecked: false,
        marca: "",
        image: "",
        description: "",
        price: "",
        desc: "",
        stock: "",
      });

      const [errors, setErrors] = useState({
        title: "",
        marca: "",
        image: "",
        description: "",
        price: "",
        desc: "",
        stock: "",
      });

      const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
          setNewProduct({ ...newProduct, [name]: checked });
        } else {
          setNewProduct({ ...newProduct, [name]: value });
        }
        const newErrors = validateProductForm({ ...newProduct, [name]: value });
        setErrors({ ...errors, [name]: newErrors[name] || "" });
      };

      const handleFile = async (event) => {
        const file = event.target.files[0];
        if (file) {
          setLoadingImage(true);
    
          try {
            const imageUrl = await uploadFile(file);
            setNewProduct({
              ...newProduct,
              image: imageUrl,
            });
          } catch (error) {
            console.error("Error al cargar la imagen:", error);
          } finally {
            setLoadingImage(false);
          }
        }
      };

      const handleImageClear = () => {
        setNewProduct({
          ...newProduct,
          image: "",
        });
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formErrors = validateProductForm(newProduct);
    
        if (Object.values(formErrors).some((error) => error)) {
          setErrors(formErrors);
          return;
        }
    
        let postData = {
          title: newProduct.title.trim(),
          image: newProduct.image,
          description: newProduct.description.trim(),
          price: newProduct.price,
          desc: newProduct.desc ? newProduct.desc : 0,
          stock: newProduct.stock,
          delivery: newProduct.delivery,
          storeId: storeId,
          userId: userData.id,
          ciudad: userStore.ciudad,
          adultContent: newProduct.adultContent,
        };
        if (newProduct.marcaChecked) {
          postData.marca = newProduct.marca;
        }
    
        try {
          const response = await axios.post("/posts/createPost", postData);
          if (response) {
            navigate(`/mitienda/${storeId}`);
            Swal.fire({
              icon: "success",
              title: `Producto creado con exito!`,
              text: "Echale un vistazo en tu tienda para comprobar que haya quedado bien!",
              confirmButtonColor: "#6495ed",
            });
          }
        } catch (error) {
          console.error(error);
        }
      };

      return (
      <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={style.container}
      >
        <div className={style.title}>
          <h3>Actualizar datos de producto</h3>
        </div>
        <form className={style.create}>
          <div className={style.part1}>
            <div className={style.title}>
              <label>
                Título
                <input
                  className={style.input}
                  type="text"
                  name="title"
                  value={productData.title}
                  placeholder={selectedPost?.title}
                  onChange={handleInputChange}
                />
                {errors.title && (
                  <span className={style.error}>{errors.title}</span>
                )}
              </label>
            </div>

            <div className={style.brand}>
              <label>
                Marca
                <input
                  className={style.input}
                  type="text"
                  name="marca"
                  value={productData.marca}
                  placeholder={
                    selectedPost?.marca
                      ? selectedPost?.marca
                      : "Ingrese la marca"
                  }
                  onChange={handleInputChange}
                />
                {errors.marca && (
                  <span className={style.error}>{errors.marca}</span>
                )}
              </label>
            </div>

            <div className={style.price}>
              <label>
                Precio
                <input
                  className={style.input}
                  type="text"
                  name="price"
                  value={productData.price}
                  placeholder={selectedPost?.price}
                  onChange={handleInputChange}
                />
                {errors.price && (
                  <span className={style.error}>{errors.price}</span>
                )}
              </label>
            </div>

            <div className={style.price}>
              <label>
                Descuento
                <input
                  className={style.input}
                  type="text"
                  name="desc"
                  value={productData.desc}
                  placeholder={
                    selectedPost?.desc ? selectedPost.desc : "% de descuento"
                  }
                  onChange={handleInputChange}
                />
                {errors.desc && (
                  <span className={style.error}>{errors.desc}</span>
                )}
              </label>
            </div>
          </div>

          <div className={style.part2}>
            <div className={style.stock}>
              <label>
                Stock
                <input
                  className={style.input}
                  type="text"
                  name="stock"
                  value={productData.depto}
                  placeholder={selectedPost?.stock}
                  onChange={handleInputChange}
                />
                {errors.stock && (
                  <span className={style.error}>{errors.stock}</span>
                )}
              </label>
            </div>

            <div className={style.desc}>
              <label>
                <textarea
                  className={style.input}
                  id="description"
                  name="description"
                  value={productData.description}
                  onChange={handleInputChange}
                  placeholder={
                    selectedPost?.description
                      ? selectedPost?.description
                      : "Ingrese una descripción"
                  }
                  required
                />
                {errors.description && (
                  <span className={style.error}>{errors.description}</span>
                )}
              </label>
            </div>

            <div className={style.delivery}>
              <p>Tiene envío a domicilio</p>
              <input
                type="checkbox"
                name="delivery"
                value={productData.delivery}
                onChange={handleInputChange}
                required
              />
              {errors.delivery && (
                <span className={style.error}>{errors.delivery}</span>
              )}
            </div>

            <div className={style.images}>
              <label>
                Foto del producto
                <input
                  type="file"
                  accept="image/*"
                  name="image"
                  onChange={handleFile}
                />
                {errors.image && (
                  <span className={style.error}>{errors.image}</span>
                )}
                {loadingImage ? (
                  <>
                    <div className={style.div}></div>
                    <Spinner />
                  </>
                ) : (
                  productData.image && (
                    <div className={style.imagePreview}>
                      <img
                        src={productData.image}
                        alt="Preview"
                        className={style.imgUser}
                      />
                      <button onClick={handleImageClear}>x</button>
                    </div>
                  )
                )}
              </label>
            </div>
          </div>
        </form>

        <button type="submit" onClick={handleSubmit} className={style.button}>
          Actualizar
        </button>
      </motion.div>
    </>
  );
};