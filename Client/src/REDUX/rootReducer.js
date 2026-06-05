import { combineReducers } from "redux";
import productsReducer from "./reducers/ProductsReducer";
import cartReducer from "./reducers/CartReducer";
import ordersReducer from "./reducers/OrdersReducer";
import notificationReducer from "./reducers/NotificationReducer";
import filtersReducer from "./reducers/FiltersReducer";
import searchReducer from "./reducers/SearchReducer";


const rootReducer = combineReducers({
  products: productsReducer,
  filters: filtersReducer,
  search: searchReducer,
  cart: cartReducer,
  orders: ordersReducer,
  notifications: notificationReducer,
});

export default rootReducer;