import {
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        {/* BRAND */}
        <div className={styles.brand}>
          <h2>HYPNOTIKA</h2>

          <p>
            Moda urbana, accesorios y estilo.
            Descubre productos únicos con
            identidad propia.
          </p>
        </div>

        {/* LINKS */}
        <div className={styles.links}>
          <h3>Navegación</h3>

          <Link to="/">Inicio</Link>

          <Link to="/products">
            Productos
          </Link>

          <Link to="/cart">Carrito</Link>
        </div>

        {/* CONTACT */}
        <div className={styles.contact}>
          <h3>Contacto</h3>

          <a
            href="https://wa.me/5493510000000"
            target="_blank"
          >
            WhatsApp
          </a>

          <a
            href="mailto:contacto@hypnotika.com"
          >
            contacto@hypnotika.com
          </a>

          <span>Córdoba, Argentina</span>
        </div>

        {/* SOCIAL */}
        <div className={styles.social}>
          <h3>Redes</h3>

          <div className={styles.icons}>
            <a
              href="https://instagram.com"
              target="_blank"
            >
              <FaInstagram />
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
            >
              <FaTiktok />
            </a>

            <a
              href="https://wa.me/5493510000000"
              target="_blank"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          © 2026 HYPNOTIKA — Todos los
          los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;