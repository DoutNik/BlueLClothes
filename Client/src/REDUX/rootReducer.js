import { combineReducers } from "redux";
import productsReducer from "./reducers/ProductsReducer";
import cartReducer from "./reducers/CartReducer";

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
});

export default rootReducer;