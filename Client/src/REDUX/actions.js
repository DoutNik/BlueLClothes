import api from "../api/api";
import {
  GET_PRODUCTS_REQUEST,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_FAILURE,
  SET_CATEGORY,
  SET_BRAND,
  SET_COLOR,
  SET_MIN_PRICE,
  SET_MAX_PRICE,
  SET_SORT,
  SET_IN_STOCK,
  CLEAR_FILTERS,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  INCREASE_QTY,
  DECREASE_QTY,
  CLEAR_CART,
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  ADD_NOTIFICATION,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
  DELETE_NOTIFICATION,
  SET_SEARCH,
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

/* FILTERS */
export const setCategory = (category) => ({
  type: SET_CATEGORY,
  payload: category,
});
export const setBrand = (value) => ({
  type: SET_BRAND,
  payload: value,
});

export const setColor = (value) => ({
  type: SET_COLOR,
  payload: value,
});

export const setMinPrice = (value) => ({
  type: SET_MIN_PRICE,
  payload: value,
});

export const setMaxPrice = (value) => ({
  type: SET_MAX_PRICE,
  payload: value,
});

export const setSort = (value) => ({
  type: SET_SORT,
  payload: value,
});

export const setOnlyStock = (value) => ({
  type: SET_IN_STOCK,
  payload: value,
});

export const clearFilters = () => ({
  type: CLEAR_FILTERS,
});

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
      const res = await api.get("/orders/getOrders");

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

export const getNotifications = () => async (dispatch) => {
  try {
    dispatch({
      type: "GET_NOTIFICATIONS_REQUEST",
    });

    const res = await api.get("/notifications");

    dispatch({
      type: "GET_NOTIFICATIONS_SUCCESS",
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: "GET_NOTIFICATIONS_FAILURE",
      payload: error.message,
    });
  }
};

export const addNotification = (notification) => ({
  type: "ADD_NOTIFICATION",
  payload: notification,
});

export const markNotificationRead = (id) => async (dispatch) => {
  try {
    await api.put(`/notifications/${id}/read`);

    dispatch({
      type: "MARK_NOTIFICATION_READ",
      payload: id,
    });
  } catch (error) {
    console.log(error);
  }
};

export const markAllNotificationsRead = () => async (dispatch) => {
  try {
    await api.put("/notifications/read-all");

    dispatch({
      type: "MARK_ALL_NOTIFICATIONS_READ",
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteNotification = (id) => async (dispatch) => {
  try {
    await api.delete(`/notifications/${id}`);

    dispatch({
      type: "DELETE_NOTIFICATION",
      payload: id,
    });
  } catch (error) {
    console.log(error);
  }
};


export const setSearch = (value) => {
  return {
    type: SET_SEARCH,
    payload: value,
  };
};
