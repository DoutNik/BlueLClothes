const initialState = {
search: "",
};

const searchReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_SEARCH":
      return {
        ...state,
        search: action.payload,
      };

    default:
      return state;
  }
};

export default searchReducer;
       