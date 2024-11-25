import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductImages from "../../components/productImages/ProductImages";
import Head from "../../components/Head/Head";
import likeG from "../../assets/likeG.png";
import likeR from "../../assets/likeR.png";
import style from "./Detail.module.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addFavoritePost,
  getFavorites,
  getPostById,
  removeFavoritePost,
} from "../../redux/actions";
import axios from "axios";
import Skeleton from "../../components/Skeleton/Skeleton";
import Swal from "sweetalert2";

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const selectedPost = useSelector((state) => state.selectedPost);
  const stores = useSelector((state) => state.allStoresCopy);
  const userData = useSelector((state) => state.userData);
  const favorites = useSelector((state) => state.favorites);

  const [selectedStore, setSelectedStore] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(selectedPost?.price);
  const [buyButton, setBuyButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [buyDirButton, setBuyDirButton] = useState(false);
  const [cupones, setCupones] = useState([]);
  const [cuponesAplicados, setCuponesAplicados] = useState([]);
  const storedCity = localStorage.getItem("selectedCity");

  const userId = userData?.id;
  const postId = parseInt(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(getPostById(postId)).then(() => setIsLoading(false));
  }, [dispatch, postId]);

  useEffect(() => {
    if (!isLoading) {
      const selectedStore = stores?.find(
        (store) => store.id == selectedPost?.storeId
      );
      setSelectedStore(selectedStore);
    }
  }, [isLoading, selectedPost, stores]);

  //=================================================================

  useEffect(() => {
    const fetchDataAcct = async () => {
      if (selectedStore && !isLoading) {
        const result = await axios.get(
          `/users/anotherUserId/?id=${selectedStore.userId}`
        );

        if (result.data?.accT) {
          setBuyButton(true);
        }

        if (userData?.direccion) {
          setBuyDirButton(true);
        }
      }
    };
    fetchDataAcct();
  }, [selectedStore, selectedPost]);

  console.log("acct", buyButton);
  console.log("dir", buyDirButton);

  //=================================================================

  const linkName = selectedStore && selectedStore.nombre?.replace(/\s/g, "-");
  const isBuyButtonDisabled = quantity <= 0 || selectedPost?.stock === 0;

  function decrement() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }
  function increment() {
    if (quantity < selectedPost?.stock) {
      setQuantity(quantity + 1);
    }
  }

  //=================================================================

  useEffect(() => {
    setTotalPrice(
      selectedPost?.price * quantity * ((100 - selectedPost?.desc) / 100)
    );
  }, [quantity, selectedPost?.price, selectedPost?.desc]);

  const handleBuy = async () => {
    try {
      let cupon = cuponesAplicados[0]?.cupon || 0;

      if (cupon > 0) {
        Swal.fire({
          icon: "success",
          title: `Cupón: $ ${cupon}`,
          text: "Se aplicará el descuento en su compra",
          showConfirmButton: false,
          timer: 3000,
        });
      }

      if (quantity <= 0 || quantity > selectedPost.stock) {
        throw new Error("Disculpe, no hay más stock disponible");
      }

      const confirmResult = await Swal.fire({
        title: `Estás por comprar ${quantity} ${selectedPost.title}`,
        html: `
    <b>Total a pagar: $${totalPrice - cupon}</b>
  
    <p>*Debes acordar la forma de pago con el vendedor</p>

    <b>¿Deseas continuar?</b>
  `,
        imageUrl: selectedPost.image,
        imageHeight: 150,
        imageAlt: "A tall image",
        showCancelButton: true,
        confirmButtonText: "Sí",
        confirmButtonColor: "#6495ed",
        cancelButtonText: "No",
      });

      if (!confirmResult.isConfirmed) return;

      const postResult = await axios.get(`/posts/getPost/${selectedPost.id}`);
      const userResult = await axios.get(
        `/users/anotherUserId/?id=${postResult.data.userId}`
      );

      const paymentData = {
        userDireccion: userData.direccion || null,
        delivery: selectedPost.delivery,
        accT: userResult.data.accT,
        postId: selectedPost.id,
        userId: userData.id,
        title: selectedPost.title,
        quantity: quantity,
        price: totalPrice - cupon,
        currency_id: "ARG",
        description: selectedPost.description,
      };

      const response = await axios.post("/tiendas/create-order", paymentData);

      if (response) {
        Swal.fire({
          icon: "success",
          title: "¡Tu compra fue enviada con éxito!",
          text: "Ponte en contacto con el vendedor o espera a que te contacten",
          showConfirmButton: true,
          confirmButtonColor: "#6495ed",
        }).then((result) => {
          if (result.isConfirmed) {
            dispatch(getPostById(selectedPost.id));
          }
        });
      } else {
        throw new Error(
          "Error creando la orden. Por favor, inténtalo de nuevo más tarde."
        );
      }
    } catch (error) {
      console.error("Error al realizar solicitud de compra", error);
      Swal.fire({
        icon: "error",
        title: "Error en la compra",
        text: "Ocurrió un error procesando su compra. Intente nuevamente más tarde.",
      });
    }
  };

  const handleBuyMP = async () => {
    if (cuponesAplicados[0]?.cupon > 0) {
      Swal.fire({
        icon: "success",
        title: `Cupón: $ ${cuponesAplicados[0].cupon}`,
        text: "Se aplicará el descuento en su compra",
        showConfirmButton: false,
        timer: 3000,
      });
    }

    let cupon = 0;
    if (cuponesAplicados[0]?.cupon > 0) {
      cupon = cuponesAplicados[0]?.cupon;
    }

    try {
      if (quantity > 0 && quantity <= selectedPost.stock) {
        const result1 = await axios.get(`/posts/getPost/${selectedPost.id}`);

        const result = await axios.get(
          `/users/anotherUserId/?id=${result1.data.userId}`
        );

        const paymentData = {
          userDireccion: userData.direccion ? userData.direccion : null,
          delivery: selectedPost.delivery,
          accT: result.data.accT,
          postId: selectedPost.id,
          userId: userData.id,
          title: selectedPost.title,
          quantity: quantity,
          price: totalPrice - cupon,
          currency_id: "ARG",
          description: selectedPost.description,
        };

        const response = await axios.post(
          "/tiendas/create-order-MP",
          paymentData
        );

        if (response) {
          const initPoint = response.data.response?.body?.init_point;

          if (initPoint) {
            window.open(initPoint);
            Swal.fire({
              icon: "info",
              text: `Compra enviada a Mercado Pago`,
              showConfirmButton: true,
              confirmButtonColor: "#6495ed",
            }).then((result) => {
              if (result.isConfirmed) {
                dispatch(getPostById(postId));
              }
            });
          } else {
            console.error(
              "Init point not found in the response. Please contact support."
            );
            Swal.fire({
              icon: "error",
              text: `Algo salió mal`,
              showConfirmButton: true,
              confirmButtonColor: "#6495ed",
            });
          }
        } else {
          console.error("Error creating order. Please try again later.");
          Swal.fire({
            icon: "error",
            text: `Algo salió mal`,
            showConfirmButton: true,
            confirmButtonColor: "#6495ed",
          });
        }
      } else {
        throw new Error("Disculpe, no hay mas stock disponible");
      }
    } catch (error) {
      console.error("Error al realizar solicitud de compra", error);
      Swal.fire({
        icon: "error",
        title: "Error en la compra",
        text: "Ocurrió un error procesando su compra. Intente nuevamente más tarde.",
        confirmButtonColor: "#6495ed"
      });
    }
  };

  //=================================================================

  const isPostFavorite =
    favorites && favorites.some((favorite) => favorite.postId == postId);
  const [isFavorite, setIsFavorite] = useState(isPostFavorite);

  const toggleFavorite = () => {
    if (isFavorite) {
      setIsFavorite(false);
      dispatch(removeFavoritePost(userId, selectedStore?.id, postId));
    } else {
      setIsFavorite(true);
      dispatch(addFavoritePost(userId, selectedStore?.id, postId));
    }
  };

  useEffect(() => {
    const isPostFavorite =
      favorites && favorites.some((favorite) => favorite.postId === postId);
    setIsFavorite(isPostFavorite);
  }, [favorites, postId]);

  useEffect(() => {
    if (postId !== undefined) {
      userId && dispatch(getFavorites(userId));
    }
  }, [dispatch, postId]);

  const handleChatButtonClick = async () => {
    const projectID = "236f9c42-06cc-414f-98cd-b7465ea5c29e";
    const userName = userData.username;
    const userSecret = userData.email;

    const apiUrl = "https://api.chatengine.io/chats/";

    const usernames = [selectedStore?.nombre];
    const title = selectedPost?.title;
    const isDirectChat = true;

    try {
      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Project-ID": projectID,
          "User-Name": userName,
          "User-Secret": userSecret,
        },
        body: JSON.stringify({
          usernames,
          title,
          is_direct_chat: isDirectChat,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to create chat");
      }
      navigate("/mensajes/usuario");
    } catch (error) {
      console.error("Error creating chat:", error.message);
      throw error;
    }
  };

  //=================================================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/cupones/cupones");
        setCupones(response.data);
      } catch (error) {
        console.error("Error fetching cupones:", error);
      }
    };

    fetchData();
  }, [isLoading]);

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    const filteredCupones = cupones.filter((cupon) => {
      const vencimientoDate = cupon.vence;
      return (
        vencimientoDate >= currentDate &&
        cupon.tiendaCiudad === storedCity &&
        cupon.tiendaId === selectedPost.storeId
      );
    });
    const cuponesAplicados =
      JSON.parse(localStorage.getItem("cuponesUtilizados")) || [];
    const cuponValido = filteredCupones.filter(
      (cupon) =>
        cuponesAplicados.includes(cupon.id) && cupon.compra <= totalPrice
    );
    setCuponesAplicados(cuponValido);
  }, [selectedPost?.storeId, totalPrice, storedCity, cupones]);

  //=================================================================

  if (isLoading) {
    return <Skeleton />;
  }

  const vibrateDevice = () => {
    window.navigator?.vibrate?.([20, 20]);
  };

  const handleNav = () => {
    navigate("/cupones");
  };

  const precioFormateado = selectedPost?.price.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const precioTotalFormateado = totalPrice.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <>
      <Head />
      <motion.div
        className={style.detail}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={style.sidebar}>
          <Link to={`/tienda/${linkName}`}>
            <div className={style.avatar}>
              <img src={selectedStore?.image} alt="image" />

              <h3>{selectedStore?.nombre}</h3>
            </div>
          </Link>
          <div className={style.contact}>
            <h4>
              {" "}
              <span
                style={{
                  color: selectedStore?.isOpen ? "cornflowerblue" : "red",
                }}
              >
                {selectedStore?.isOpen ? "✅ Abierto" : "❗️ Cerrado"}
              </span>
            </h4>
            <h4>
              📍 {selectedStore?.direccion?.calle}{" "}
              {selectedStore?.direccion?.numero}
              {selectedStore?.direccion?.piso && (
                <> (piso: {selectedStore.direccion?.piso})</>
              )}
              {selectedStore?.direccion?.depto && (
                <> (local: {selectedStore?.direccion?.depto})</>
              )}
            </h4>
            <h4>{selectedStore?.categoria}</h4>
            <h4>📆 {selectedStore?.dias}</h4>
            <h4>
              ⏰ {selectedStore?.horarios?.horario_de_apertura}hs a{" "}
              {selectedStore?.horarios?.horario_de_cierre}hs
              {selectedStore?.horarios?.horario_de_apertura2 &&
                selectedStore?.horarios?.horario_de_cierre2 && (
                  <>
                    {" y "}
                    {selectedStore?.horarios.horario_de_apertura2}hs a{" "}
                    {selectedStore?.horarios.horario_de_cierre2}hs
                  </>
                )}
            </h4>
          </div>
        </div>

        <div className={style.images}>
          <div
            className={style.favorite}
            onClick={() => {
              toggleFavorite();
              vibrateDevice();
            }}
          >
            <img
              src={isFavorite ? likeR : likeG}
              alt="like"
              className={style.fav}
            />
          </div>
          <ProductImages images={selectedPost.image} />
        </div>

        <div className={style.info}>
          <h2>{selectedPost.title}</h2>
          <h2 className={style.marca}>{selectedPost?.marca}</h2>

          <div className={style.precio}>
            <span>Precio:</span>
            {selectedPost?.desc > 0 ? (
              <>
                <h4>{precioTotalFormateado}</h4>
                <del>
                  <h4>{precioFormateado}</h4>
                </del>
              </>
            ) : (
              <h4>{precioTotalFormateado}</h4>
            )}
          </div>

          {cuponesAplicados.length > 0 ? (
            <p className={style.cupon}>
              Cupón: - ${cuponesAplicados[0]?.cupon}
            </p>
          ) : (
            <p className={style.cuponNo} onClick={handleNav}>
              No hay cupones aplicados
            </p>
          )}

          <div className={style.descu}>
            {selectedPost?.desc > 0 ? (
              <h4>-{selectedPost?.desc}% OFF</h4>
            ) : (
              <div></div>
            )}
          </div>

          <div className={style.but}>
            <button onClick={decrement} className={style.menos}>
              -
            </button>
            <input
              disabled
              id="cantidad"
              name="cantidad"
              min="1"
              max={selectedPost.stock}
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            ></input>
            <button onClick={increment}>+</button>
          </div>

          <p className={selectedPost.stock === 0 && style.red}>
            {" "}
            Stock: {selectedPost.stock === 0 ? "Sin stock" : selectedPost.stock}
          </p>
          <div className={style.envio}>
            <h5>
              {selectedPost.delivery
                ? "Envío disponible 🛵"
                : "Retirar en tienda 🙋🏻‍♂️"}
            </h5>
          </div>

          {buyButton ? (
            selectedPost.delivery ? (
              buyDirButton ? (
                selectedPost.stock > 0 ? (
                  <div className={style.comprar}>
                    <button
                      onClick={handleBuyMP}
                      disabled={isBuyButtonDisabled}
                    >
                      Comprar
                    </button>
                  </div>
                ) : (
                  <div className={style.comprar}>
                    <p>No hay stock disponible.</p>
                  </div>
                )
              ) : (
                <div className={style.comprar}>
                  <p>
                    Necesitas una dirección para comprar productos con envío.
                  </p>
                </div>
              )
            ) : selectedPost.stock > 0 ? (
              <div className={style.comprar}>
                <button onClick={handleBuyMP} disabled={isBuyButtonDisabled}>
                  Comprar
                </button>
              </div>
            ) : (
              <div className={style.comprar}>
                <p>No hay más stock disponible.</p>
              </div>
            )
          ) : selectedPost.delivery ? (
            buyDirButton ? (
              selectedPost.stock > 0 ? (
                <div className={style.comprar}>
                  <button onClick={handleBuy} disabled={isBuyButtonDisabled}>
                    Comprar
                  </button>
                </div>
              ) : (
                <div className={style.comprar}>
                  <p>No hay stock disponible.</p>
                </div>
              )
            ) : (
              <div className={style.comprar}>
                <p>Necesitas una dirección para comprar productos con envío.</p>
              </div>
            )
          ) : selectedPost.stock > 0 ? (
            <div className={style.comprar}>
              <button onClick={handleBuy} disabled={isBuyButtonDisabled}>
                Comprar
              </button>
            </div>
          ) : (
            <div className={style.comprar}>
              <p>No hay más stock disponible.</p>
            </div>
          )}
        </div>
      </motion.div>
      <div className={style.desc}>
        <p>{selectedPost?.description}</p>
      </div>
    </>
  );
};

export default Detail;
