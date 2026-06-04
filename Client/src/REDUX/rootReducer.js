import { combineReducers } from "redux";
import productsReducer from "./reducers/ProductsReducer";
import cartReducer from "./reducers/CartReducer";
import ordersReducer from "./reducers/OrdersReducer";
import notificationReducer from "./reducers/NotificationReducer";
import filtersReducer from "./reducers/FiltersReducer";


const rootReducer = combineReducers({
  products: productsReducer,
  filters: filtersReducer,
  cart: cartReducer,
  orders: ordersReducer,
  notifications: notificationReducer,
});

export default rootReducer;