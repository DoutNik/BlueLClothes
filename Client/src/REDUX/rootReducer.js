import { combineReducers } from "redux";
import productsReducer from "./reducers/ProductsReducer";
import cartReducer from "./reducers/CartReducer";
import ordersReducer from "./reducers/OrdersReducer";

const rootReducer = combineReducers({
  products: productsReducer,
  cart: cartReducer,
  orders: ordersReducer,
});

export default rootReducer;