import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Jornal Santista</h5>
            <p className="mb-0">
              Uma visão crítica sobre a nossa realidade na Baixada Santista.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <p className="mb-0">
              © 2024 Jornal Santista. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 