import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      {/* Barra superior com data */}
      <div className="bg-dark text-white py-2">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <small className="text-muted">
                {currentDate}
              </small>
            </div>
            <div className="col-md-6 text-end">
              <small className="text-muted">
                Baixada Santista, SP
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom">
        <div className="container">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <div>
              <div className="fw-bold fs-4" style={{ letterSpacing: '1px' }}>
                JORNAL SANTISTA
              </div>
              <small className="text-muted d-block" style={{ fontSize: '0.7rem' }}>
                Uma visão crítica sobre a nossa realidade
              </small>
            </div>
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
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/categorias">
                  Categorias
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/sobre">
                  Sobre
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/contato">
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header; 