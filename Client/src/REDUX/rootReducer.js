import { combineReducers } from "redux";
import productsReducer from "./reducer";

const rootReducer = combineReducers({
  products: productsReducer,
});

export default rootReducer;