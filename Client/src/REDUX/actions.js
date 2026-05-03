import api from "../api/api";
import {
  GET_PRODUCTS_REQUEST,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_FAILURE,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  INCREASE_QTY,
  DECREASE_QTY,
  CLEAR_CART,
} from "./actionTypes";

/* PRODUCTS */
export const getProducts = () => {
  return async (dispatch) => {
    dispatch({ type: GET_PRODUCTS_REQUEST });

    try {
      const res = await api.get("/products");

      const products = Array.isArray(res.data)
        ? res.data
        : res.data.products || [];

      dispatch({
        type: GET_PRODUCTS_SUCCESS,
        payload: products,
      });
    } catch (error) {
      dispatch({
        type: GET_PRODUCTS_FAILURE,
        payload: error.message || "Error al obtener productos",
      });
    }
  };
};

/* CART */
export const addToCart = (product, quantity = 1) => ({
  type: ADD_TO_CART,
  payload: { product, quantity },
});

export const removeFromCart = (id) => ({
  type: REMOVE_FROM_CART,
  payload: id,
});

export const increaseQty = (id) => ({
  type: INCREASE_QTY,
  payload: id,
});

export const decreaseQty = (id) => ({
  type: DECREASE_QTY,
  payload: id,
});

export const clearCart = () => ({
  type: CLEAR_CART,
});


// ORDERS
export const getOrders = () => {
  return async (dispatch) => {
    dispatch({ type: "GET_ORDERS_REQUEST" });

    try {
      const res = await api.get("/orders");

      dispatch({
        type: "GET_ORDERS_SUCCESS",
        payload: res.data,
      });
    } catch (err) {
      dispatch({
        type: "GET_ORDERS_FAILURE",
        payload: err.message,
      });
    }
  };
};