// Glasses.jsx
import React from 'react';

const Glasses = () => {
    return (
        <div className="container text-center mt-5">
            <h2 className="mb-4">Colección de Gafas</h2>
            <div className="row">
                <div className="col-12 col-md-4 mb-3">
                    <div className="card">
                        <img src="https://via.placeholder.com/200" className="card-img-top" alt="Gafa 1" />
                        <div className="card-body">
                            <h5 className="card-title">Gafa Elegante</h5>
                            <p className="card-text">Gafas modernas para todos los estilos.</p>
                            <button className="btn btn-primary">Ver Más</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4 mb-3">
                    <div className="card">
                        <img src="https://via.placeholder.com/200" className="card-img-top" alt="Gafa 2" />
                        <div className="card-body">
                            <h5 className="card-title">Gafa Deportiva</h5>
                            <p className="card-text">Perfectas para tus actividades al aire libre.</p>
                            <button className="btn btn-primary">Ver Más</button>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4 mb-3">
                    <div className="card">
                        <img src="https://via.placeholder.com/200" className="card-img-top" alt="Gafa 3" />
                        <div className="card-body">
                            <h5 className="card-title">Gafa Vintage</h5>
                            <p className="card-text">Diseño retro para los amantes de lo clásico.</p>
                            <button className="btn btn-primary">Ver Más</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Glasses;
