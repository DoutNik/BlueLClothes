import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo1 from "../../assets/logo2.png";

const Navbar = () => {
  const navigate = useNavigate();

const storedUser = localStorage.getItem("user");

const user =
  storedUser && storedUser !== "undefined"
    ? JSON.parse(storedUser)
    : null;
    
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload(); // simple refresh
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container">
        <Link to="/">
          <img src={logo1} alt="BlueGlass Logo" className="navbar-logo" />
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-2">
            {/* LINKS BASE */}
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Inicio
              </Link>
            </li>

            {/* NO LOGUEADO */}
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Registrarse
                  </Link>
                </li>
              </>
            )}

            {/* LOGUEADO */}
            {user && (
              <>
                <li className="nav-item">
                  <span className="nav-link text-light">
                    Hola {user.firstName || "User"}
                  </span>
                </li>

                {/* ADMIN */}
                {user.role === "admin" && (
                  <li className="nav-item">
                    <Link
                      className="btn btn-warning btn-sm"
                      to="/admin/products"
                    >
                      Admin
                    </Link>
                  </li>
                )}

                <li className="nav-item">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
