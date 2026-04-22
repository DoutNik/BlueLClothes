import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import logo1 from "../../assets/logo2.png";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const storedUser = localStorage.getItem("user");

  const user =
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
    window.location.reload();
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.container}>
          <Link to="/">
            <img src={logo1} alt="logo" className={styles.logo} />
          </Link>

          {/* DESKTOP MENU */}
          <div className={styles.desktopMenu}>
            <Link className={styles.link} to="/">Inicio</Link>

            {!user && (
              <>
                <Link className={styles.link} to="/login">Login</Link>
                <Link className={styles.link} to="/register">Registrarse</Link>
              </>
            )}

            {user && (
              <>
                <span className={styles.user}>
                  Hola {user.firstName || "User"}
                </span>

                {user.role === "admin" && (
                  <Link className={styles.adminBtn} to="/admin/dashboard">
                    ⚡ Admin Panel
                  </Link>
                )}

                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>

          {/* MOBILE TOGGLER */}
          <button
            className={styles.toggler}
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* MODAL MOBILE */}
      {menuOpen && (
        <div className={styles.overlay} onClick={closeMenu}>
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={closeMenu}>
              ✕
            </button>

            <Link to="/" className={styles.link} onClick={closeMenu}>
              Inicio
            </Link>

            {!user && (
              <>
                <Link to="/login" className={styles.link} onClick={closeMenu}>
                  Login
                </Link>
                <Link to="/register" className={styles.link} onClick={closeMenu}>
                  Registrarse
                </Link>
              </>
            )}

            {user && (
              <>
                <span className={styles.user}>
                  Hola {user.firstName || "User"}
                </span>

                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className={styles.adminBtn}
                    onClick={closeMenu}
                  >
                    ⚡ Admin Panel
                  </Link>
                )}

                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;