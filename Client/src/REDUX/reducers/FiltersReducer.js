import {
  SET_CATEGORY,
  SET_SEARCH,
  SET_MIN_PRICE,
  SET_MAX_PRICE,
  SET_BRAND,
  SET_COLOR,
  SET_IN_STOCK,
  SET_SORT,
  CLEAR_FILTERS,
} from "../actionTypes";

const initialState = {
  category: null,

  search: "",

  minPrice: "",

  maxPrice: "",

  brand: "",

  color: "",

  inStockOnly: false,

  sortBy: "relevance",
};

export default function filtersReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CATEGORY:
      return {
        ...state,
        category: action.payload,
      };

    case SET_SEARCH:
      return {
        ...state,
        search: action.payload,
      };

    case SET_MIN_PRICE:
      return {
        ...state,
        minPrice: action.payload,
      };

    case SET_MAX_PRICE:
      return {
        ...state,
        maxPrice: action.payload,
      };

    case SET_BRAND:
      return {
        ...state,
        brand: action.payload,
      };

    case SET_COLOR:
      return {
        ...state,
        color: action.payload,
      };

    case SET_IN_STOCK:
      return {
        ...state,
        inStockOnly: action.payload,
      };

    case SET_SORT:
      return {
        ...state,
        sortBy: action.payload,
      };

    case CLEAR_FILTERS:
      return initialState;

    default:
      return state;
  }
}
