import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5 border-top border-secondary">
      <div className="container">
        <div className="row align-items-center gy-3">
          <div className="col-md-4 text-center text-md-start">
            <h5 className="mb-1">Jornal Santista</h5>
            <p className="mb-0 small">
              Uma visão crítica sobre a nossa realidade na Baixada Santista.
            </p>
          </div>
          <div className="col-md-4 text-center my-2 my-md-0">
            <a href="mailto:contato@jornalsantista.org" className="text-white me-3" title="E-mail">
              <i className="bi bi-envelope-fill"></i>
            </a>
            <a href="https://facebook.com/jornalsantista" className="text-white me-3" target="_blank" rel="noopener noreferrer" title="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="https://twitter.com/jornalsantista" className="text-white me-3" target="_blank" rel="noopener noreferrer" title="Twitter">
              <i className="bi bi-twitter"></i>
            </a>
            <a href="https://instagram.com/jornalsantista" className="text-white" target="_blank" rel="noopener noreferrer" title="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
          </div>
          <div className="col-md-4 text-center text-md-end">
            <p className="mb-0 small">
              © 2024 <span className="fw-bold">Jornal Santista</span>. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 