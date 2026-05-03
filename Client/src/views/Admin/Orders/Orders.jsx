import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrders } from "../../REDUX/actions";
import styles from "./AdminOrders.module.css";

const Orders = () => {
  const dispatch = useDispatch();

  const { orders, loading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  if (loading) return <p>Cargando ventas...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>💰 Ventas y Pedidos</h1>

      {orders.length === 0 ? (
        <p>No hay ventas aún</p>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => (
            <div key={order.id} className={styles.card}>
              <div className={styles.header}>
                <span>Orden #{order.id}</span>
                <span
                  className={`${styles.status} ${
                    styles[order.status]
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className={styles.body}>
                <p>Total: ${order.total}</p>
                <p>
                  Fecha:{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              <div className={styles.products}>
                {order.OrderItems?.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <span>{item.title}</span>
                    <span>
                      {item.quantity} x ${item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;