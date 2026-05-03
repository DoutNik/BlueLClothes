const initialState = {
  orders: [],
  loading: false,
  error: null,
};

switch (action.type) {
  case "GET_ORDERS_REQUEST":
    return { ...state, loading: true };

  case "GET_ORDERS_SUCCESS":
    return { ...state, loading: false, orders: action.payload };

  case "GET_ORDERS_FAILURE":
    return { ...state, loading: false, error: action.payload };
}