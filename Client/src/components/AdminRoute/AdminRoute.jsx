import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const storedUser = localStorage.getItem("user");

  const user =
    storedUser && storedUser !== "undefined"
      ? JSON.parse(storedUser)
      : null;

  // no logueado
  if (!user) {
    return <Navigate to="/login" />;
  }

  // logueado pero no admin
  if (user.role !== "admin") {
    return <Navigate to="/" />;
  }

  // autorizado
  return children;
};

export default AdminRoute;