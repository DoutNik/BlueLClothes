import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./AdminDashboard.module.css";
import { useSelector } from "react-redux";
import api from "../../api/api";
import SalesCalendar from "./SalesCalendar/SalesCalendar";

const AdminDashboard = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [metrics, setMetrics] = useState({
    products: 0,
    users: 0,
    published: 0,
    drafts: 0,
    paused: 0,
    orders: 0,
  });

  const orders = useSelector((state) => state.orders);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setMetrics(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>⚡ ADMIN DASHBOARD</h1>

      {/* METRICS */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <h3>Total Productos</h3>
          <p>{metrics.products}</p>
        </div>

        <div className={styles.metricCard}>
          <h3>Publicados</h3>
          <p>{metrics.published}</p>
        </div>

        <div className={styles.metricCard}>
          <h3>Borradores</h3>
          <p>{metrics.drafts}</p>
        </div>

        <div className={styles.metricCard}>
          <h3>Pausados</h3>
          <p>{metrics.paused}</p>
        </div>

        <div className={styles.metricCard}>
          <h3>Usuarios</h3>
          <p>{metrics.users}</p>
        </div>

        <div className={styles.metricCard}>
          <h3>Ventas</h3>
          <p>{metrics.orders}</p>
        </div>

        <Link
          to="#"
          className={styles.actionCard}
          onClick={() => setShowCalendar(true)}
        >
          📅 Calendario de ventas
        </Link>
      </div>

      {/* ACTION CARDS */}
      <div className={styles.actionsGrid}>
        <Link to="/admin/products" className={styles.actionCard}>
          📦 Gestión de Productos
        </Link>

        <Link to="/admin/create-product" className={styles.actionCard}>
          ➕ Crear Producto
        </Link>

        <Link to="/admin/orders" className={styles.actionCard}>
          💰 Ventas
        </Link>

        <Link to="/admin/users" className={styles.actionCard}>
          👥 Gestión de Usuarios
        </Link>
      </div>
      {showCalendar && (
        <SalesCalendar onClose={() => setShowCalendar(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
