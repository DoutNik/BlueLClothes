import React from 'react';
import './Glasses.css';

const Glasses = () => {
    const glasses = [
        { title: "Elegante", desc: "Minimalismo moderno." },
        { title: "Deportiva", desc: "Rendimiento y estilo." },
        { title: "Vintage", desc: "Clásico atemporal." },
        { title: "Urbana", desc: "Diseño street." },
    ];

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-5">Colección de Gafas</h2>

            <div className="row">
                {glasses.map((g, i) => (
                    <div key={i} className="col-6 col-lg-3 mb-4">
                        <div className="card-pro">
                            <img src="https://via.placeholder.com/500" alt={g.title} />

                            <div className="card-dark-overlay" />

                            <div className="card-content">
                                <h5>{g.title}</h5>
                                <p>{g.desc}</p>
                                <button>Ver más</button>
                            </div>

                            <div className="card-tag">
                                {g.title}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Glasses;