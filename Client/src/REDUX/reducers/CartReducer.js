import {
  ADD_TO_CART,
  REMOVE_FROM_CART,
  INCREASE_QTY,
  DECREASE_QTY,
  CLEAR_CART,
} from "../actionTypes";

const savedCart = JSON.parse(localStorage.getItem("cart")) || [];

const initialState = {
  items: savedCart,
};

const cartReducer = (state = initialState, action) => {
  let updatedItems = [];

  switch (action.type) {
    case ADD_TO_CART: {
      const { product, quantity } = action.payload;

      const existing = state.items.find((item) => item.id === product.id);

      if (existing) {
        updatedItems = state.items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...product, quantity }];
      }

      localStorage.setItem("cart", JSON.stringify(updatedItems));

      return { ...state, items: updatedItems };
    }

    case REMOVE_FROM_CART:
      updatedItems = state.items.filter(
        (item) => item.id !== action.payload
      );

      localStorage.setItem("cart", JSON.stringify(updatedItems));

      return { ...state, items: updatedItems };

    case INCREASE_QTY:
      updatedItems = state.items.map((item) =>
        item.id === action.payload
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

      localStorage.setItem("cart", JSON.stringify(updatedItems));

      return { ...state, items: updatedItems };

    case DECREASE_QTY:
      updatedItems = state.items
        .map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);

      localStorage.setItem("cart", JSON.stringify(updatedItems));

      return { ...state, items: updatedItems };

    case CLEAR_CART:
      localStorage.removeItem("cart");
      return { ...state, items: [] };

    default:
      return state;
  }
};

export default cartReducer;