import { createContext, useContext, useEffect } from "react";

import socket from "../socket";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    const user =
      storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

    if (!user) return;

    // ROOM GLOBAL USERS
    socket.emit("join_users");

    // ROOM PRIVADA
    socket.emit("join_user", user.id);

    // ROOM ADMINS
    if (user.role === "admin") {
      socket.emit("join_admin");
    }

    return () => {
      socket.off();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
