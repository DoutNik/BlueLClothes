import {
  useEffect,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import socket from "../../../socket";

import {
  getNotifications,
  addNotification,
  markNotificationRead,
  deleteNotification,
} from "../../../REDUX/actions";

import styles from "./AdminNotifications.module.css";

const AdminNotifications = () => {
  const dispatch = useDispatch();

  const { notifications } =
    useSelector(
      (state) =>
        state.notifications
    );

  useEffect(() => {
    dispatch(getNotifications());

    socket.emit("join_admin");

    socket.on(
      "new_notification",
      (notification) => {

        dispatch(
          addNotification(
            notification
          )
        );

        // 🔥 sonido
        const audio = new Audio(
          "/notification.mp3"
        );

        audio.play();
      }
    );

    return () => {
      socket.off(
        "new_notification"
      );
    };
  }, [dispatch]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        🔔 Notificaciones
      </h1>

      <div className={styles.list}>
        {notifications.map(
          (notification) => (
            <div
              key={notification.id}
              className={`${styles.card}
              ${
                !notification.read
                  ? styles.unread
                  : ""
              }`}
            >
              <div
                className={
                  styles.header
                }
              >
                <h3>
                  {
                    notification.title
                  }
                </h3>

                <span>
                  {
                    notification.type
                  }
                </span>
              </div>

              <p>
                {
                  notification.message
                }
              </p>

              <small>
                {new Date(
                  notification.createdAt
                ).toLocaleString()}
              </small>

              <div
                className={
                  styles.actions
                }
              >
                {!notification.read && (
                  <button
                    onClick={() =>
                      dispatch(
                        markNotificationRead(
                          notification.id
                        )
                      )
                    }
                  >
                    Leer
                  </button>
                )}

                <button
                  onClick={() =>
                    dispatch(
                      deleteNotification(
                        notification.id
                      )
                    )
                  }
                >
                  Eliminar
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;