import {
  GET_PRODUCTS_REQUEST,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_FAILURE,
} from "./actionTypes";

const initialState = {
  allProducts: [],
  loading: false,
  error: null,
};

const productsReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_PRODUCTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        allProducts: action.payload,
      };

    case GET_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default productsReducer;