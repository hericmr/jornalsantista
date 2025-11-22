import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h5 className="footer-title">Jornal Santista</h5>
            <p className="footer-subtitle">Mídia alternativa na Baixada</p>
            <p className="footer-description">
              Uma visão crítica sobre a nossa realidade na Baixada Santista.
            </p>
          </div>
          
          <div className="footer-section">
            <h6 className="footer-section-title">Links Rápidos</h6>
            <ul className="footer-links">
              <li><a href="/">Início</a></li>
              <li><a href="/sobre">Sobre</a></li>
              <li><a href="/categorias">Artigos</a></li>
              <li><a href="/contato">Contato</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h6 className="footer-section-title">Redes Sociais</h6>
            <div className="footer-social">
              <a href="mailto:contato@jornalsantista.org" className="social-link" title="E-mail">
                <i className="bi bi-envelope-fill"></i>
              </a>
              <a href="https://facebook.com/jornalsantista" className="social-link" target="_blank" rel="noopener noreferrer" title="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://twitter.com/jornalsantista" className="social-link" target="_blank" rel="noopener noreferrer" title="Twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="https://instagram.com/jornalsantista" className="social-link" target="_blank" rel="noopener noreferrer" title="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} <strong>Jornal Santista</strong>. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 