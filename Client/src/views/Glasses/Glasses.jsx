import styles from "./Glasses.module.css";
import Categories from "../../components/Categories/Categories";
import backgroundImage from "../../assets/backgroundImage.jpg";

const Glasses = () => {
  const glasses = [
    { title: "Elegante", desc: "Minimalismo moderno." },
    { title: "Deportiva", desc: "Rendimiento y estilo." },
    { title: "Vintage", desc: "Clásico atemporal." },
    { title: "Urbana", desc: "Diseño street." },
  ];

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <Categories />
      <h2 className="text-center mb-5">Colección de Gafas</h2>

      <div className="row">
        {glasses.map((g, i) => (
          <div key={i} className="col-6 col-lg-3 mb-4">
            <div className={styles.cardPro}>
              <img
                src="https://via.placeholder.com/500"
                alt={g.title}
                className={styles.image}
              />

              <div className={styles.overlay} />

              <div className={styles.content}>
                <h5>{g.title}</h5>
                <p>{g.desc}</p>
                <button className={styles.button}>Ver más</button>
              </div>

              <div className={styles.tag}>{g.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Glasses;