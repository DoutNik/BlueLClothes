import { useEffect, useRef, useState } from "react";

import { Bell, Check, Trash2 } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import socket from "../../Socket";

import {
  addNotification,
  deleteNotification,
  getNotifications,
  markNotificationRead,
} from "../../REDUX/actions";

import styles from "./Notifications.module.css";

const NotificationBell = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const dropdownRef = useRef();

  const [open, setOpen] = useState(false);

  const { notifications } = useSelector((state) => state.notifications);

  // UNREAD COUNT
  const unreadCount = notifications.filter((n) => !n.read).length;

  // GET INITIAL NOTIFICATIONS
  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  // SOCKETS
  useEffect(() => {
    socket.emit("join_admin");

    socket.on("new_notification", (notification) => {
      dispatch(addNotification(notification));

      // SOUND
      const audio = new Audio("/notification.mp3");

      audio.volume = 0.5;

      audio.play();
    });

    return () => {
      socket.off("new_notification");
    };
  }, [dispatch]);

  // CLOSE OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // OPEN NOTIFICATION
  const handleOpenNotification = (notification) => {
    if (!notification.read) {
      dispatch(markNotificationRead(notification.id));
    }

    if (notification.link) {
      navigate(notification.link);
    }

    setOpen(false);
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      {/* BELL */}
      <button className={styles.bellButton} onClick={() => setOpen(!open)}>
        <Bell size={22} />

        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notificaciones</h3>
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No hay notificaciones</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationCard}
                    ${!notification.read ? styles.unread : ""}`}
                >
                  {/* CLICK AREA */}
                  <div
                    className={styles.content}
                    onClick={() => handleOpenNotification(notification)}
                  >
                    <div className={styles.top}>
                      <h4>{notification.title}</h4>

                      <span>{notification.type}</span>
                    </div>

                    <p>{notification.message}</p>

                    <small>
                      {new Date(notification.createdAt).toLocaleString()}
                    </small>
                  </div>

                  {/* ACTIONS */}
                  <div className={styles.actions}>
                    {!notification.read && (
                      <button
                        onClick={() =>
                          dispatch(markNotificationRead(notification.id))
                        }
                      >
                        <Check size={16} />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        dispatch(deleteNotification(notification.id))
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
