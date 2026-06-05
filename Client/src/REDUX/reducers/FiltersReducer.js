import {
  SET_CATEGORY,
} from "../actionTypes";

const initialState = {
  category: null,
  search: "",
};

export default function filtersReducer(
  state = initialState,
  action
) {
  switch (action.type) {
    case SET_CATEGORY:
      return {
        ...state,
        category: action.payload,
      };

    default:
      return state;
  }
}