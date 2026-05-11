const initialState = {
  notifications: [],
  loading: false,
  error: null,
};

const notificationReducer = (
  state = initialState,
  action
) => {
  switch (action.type) {
    case "GET_NOTIFICATIONS_REQUEST":
      return {
        ...state,
        loading: true,
      };

    case "GET_NOTIFICATIONS_SUCCESS":
      return {
        ...state,
        loading: false,
        notifications: action.payload,
      };

    case "GET_NOTIFICATIONS_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [
          action.payload,
          ...state.notifications,
        ],
      };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications:
          state.notifications.map((n) =>
            n.id === action.payload
              ? {
                  ...n,
                  read: true,
                }
              : n
          ),
      };

    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications:
          state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
      };

    case "DELETE_NOTIFICATION":
      return {
        ...state,
        notifications:
          state.notifications.filter(
            (n) =>
              n.id !== action.payload
          ),
      };

    default:
      return state;
  }
};

export default notificationReducer;