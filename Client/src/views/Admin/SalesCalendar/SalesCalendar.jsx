import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import api from "../../../api/api";
import styles from "./SalesCalendar.module.css";

const SalesCalendar = ({ onClose }) => {
  const [date, setDate] = useState(new Date());

  const [calendarData, setCalendarData] = useState([]);

  const [summary, setSummary] = useState({});

  const [dayOrders, setDayOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [dayCache, setDayCache] = useState({});

  const salesMap = useMemo(() => {
    const map = new Map();

    calendarData.forEach((day) => {
      map.set(day.date, day);
    });

    return map;
  }, [calendarData]);

  useEffect(() => {
    loadCalendar(date);
  }, []);

  useEffect(() => {
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = "auto";
  };
}, []);

  const loadCalendar = async (selectedDate) => {
    try {
      setLoading(true);

      const month = selectedDate.getMonth() + 1;

      const year = selectedDate.getFullYear();

      const { data } = await api.get(
        `/admin/calendar?month=${month}&year=${year}`,
      );

      setCalendarData(data.days);
      setDayCache({});
      setSummary(data.summary);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDay = async (selectedDate) => {
    const localDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Cordoba",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(selectedDate);

    if (dayCache[localDate]) {
      setDayOrders(dayCache[localDate]);
      return;
    }

    try {
      const { data } = await api.get(`/admin/calendar/day?date=${localDate}`);

      setDayOrders(data);

      setDayCache((prev) => ({
        ...prev,
        [localDate]: data,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (selectedDate) => {
    setDate(selectedDate);

    loadDay(selectedDate);
  };

  const handleMonthChange = ({ activeStartDate }) => {
    loadCalendar(activeStartDate);
  };
  

  const renderTile = ({ date, view }) => {
    if (view !== "month") return null;

    const localDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Argentina/Cordoba",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);

    const day = salesMap.get(localDate);

    if (!day) return null;

    return (
      <div className={styles.tileContent}>
        <div className={styles.dots}>
          {Array.from({
            length: Math.min(day.sales, 8),
          }).map((_, index) => (
            <span key={index} className={styles.dot} />
          ))}

          {day.sales > 8 && <small>+{day.sales - 8}</small>}
        </div>

        <div className={styles.money}>
          ${day.revenue.toLocaleString("es-AR")}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>
          ✕
        </button>

        <h2>Calendario de Ventas</h2>

        {loading ? (
          <h3>Cargando...</h3>
        ) : (
          <>
            <div className={styles.summary}>
              <div>
                <span>Ventas</span>

                <strong>{summary.monthSales}</strong>
              </div>

              <div>
                <span>Facturación</span>

                <strong>
                  ${summary.monthRevenue?.toLocaleString("es-AR")}
                </strong>
              </div>

              <div>
                <span>Ticket promedio</span>

                <strong>
                  $
                  {Math.round(summary.averageTicket || 0).toLocaleString(
                    "es-AR",
                  )}
                </strong>
              </div>
            </div>

            <div className={styles.content}>
              <Calendar
                locale="es-AR"
                value={date}
                onChange={handleChange}
                onActiveStartDateChange={handleMonthChange}
                tileContent={renderTile}
              />

              <div className={styles.sidePanel}>
                <h3>{date.toLocaleDateString("es-AR")}</h3>

                {dayOrders.length === 0 && <p>No hubo ventas.</p>}

                {dayOrders.map((order) => (
                  <div key={order.id} className={styles.order}>
                    <strong>Venta #{order.id}</strong>

                    <p>${order.total.toLocaleString("es-AR")}</p>

                    <small>
                      {new Date(order.createdAt).toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesCalendar;
