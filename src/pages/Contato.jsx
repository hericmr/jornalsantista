import React from 'react';

const Contato = () => {
  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold">Contato</h1>
            <p className="lead text-muted">
              Entre em contato conosco
            </p>
          </div>

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-envelope fs-1 text-dark"></i>
                  </div>
                  <h5 className="card-title">Email</h5>
                  <p className="card-text">
                    <a href="mailto:contato@jornalsantista.com.br" className="text-decoration-none">
                      contato@jornalsantista.com.br
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <i className="bi bi-geo-alt fs-1 text-dark"></i>
                  </div>
                  <h5 className="card-title">Localização</h5>
                  <p className="card-text">
                    Baixada Santista<br />
                    São Paulo, Brasil
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body p-5">
              <h3>Redes Sociais</h3>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-facebook fs-4 me-3"></i>
                    <div>
                      <h6 className="mb-0">Facebook</h6>
                      <small className="text-muted">@jornalsantista</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-twitter fs-4 me-3"></i>
                    <div>
                      <h6 className="mb-0">Twitter</h6>
                      <small className="text-muted">@jornalsantista</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-instagram fs-4 me-3"></i>
                    <div>
                      <h6 className="mb-0">Instagram</h6>
                      <small className="text-muted">@jornalsantista</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm mt-4">
            <div className="card-body p-5">
              <h3>Envie uma Mensagem</h3>
              <p className="text-muted mb-4">
                Tem uma sugestão, denúncia ou quer colaborar conosco? 
                Entre em contato através das nossas redes sociais ou email.
              </p>
              
              <div className="alert alert-info">
                <h6>Como Contribuir</h6>
                <ul className="mb-0">
                  <li>Envie fotos e vídeos de relevância pública</li>
                  <li>Compartilhe denúncias sobre problemas locais</li>
                  <li>Participe dos debates e discussões</li>
                  <li>Ajude a divulgar o projeto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contato; 