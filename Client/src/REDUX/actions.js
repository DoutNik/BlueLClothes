import axios from "axios";
import {
  GET_PRODUCTS_REQUEST,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_FAILURE,
} from "./actionTypes";

export const getProducts = () => {
  return async (dispatch) => {
    dispatch({ type: GET_PRODUCTS_REQUEST });

    try {
      const res = await axios.get("http://localhost:3001/products");

      // 🔍 aseguramos que siempre sea array
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