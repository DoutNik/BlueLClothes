import React from "react";
import { Link } from "react-router-dom";
import logo2 from "../../assets/logo.png";
import logo1 from "../../assets/logo2.png"

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container">
      <Link to="/">
          <img
            src={logo1}
            alt="BlueGlass Logo"
            className="navbar-logo"
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Agregar la clase `ms-auto` aquí para alinear a la derecha */}
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/ropa">
                Ropa
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/gafas">
                Gafas
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
