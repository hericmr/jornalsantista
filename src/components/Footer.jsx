import React from 'react';
import { BsEnvelopeFill, BsFacebook, BsInstagram, BsTwitter, BsYoutube } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { SITE } from '../config/site';

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
              <li><Link to="/">Início</Link></li>
              <li><Link to="/sobre">Sobre</Link></li>
              <li><Link to="/categorias">Artigos</Link></li>
              <li><Link to="/contato">Contato</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h6 className="footer-section-title">Redes Sociais</h6>
            <div className="footer-social">
              <a href={`mailto:${SITE.email}`} className="social-link" title="E-mail" aria-label="E-mail">
                <BsEnvelopeFill className="bi" />
              </a>
              <a href={SITE.social.facebook} className="social-link" target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook">
                <BsFacebook className="bi" />
              </a>
              <a href={SITE.social.twitter} className="social-link" target="_blank" rel="noopener noreferrer" title="Twitter" aria-label="Twitter">
                <BsTwitter className="bi" />
              </a>
              <a href={SITE.social.instagram} className="social-link" target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram">
                <BsInstagram className="bi" />
              </a>
              <a href={SITE.social.youtube} className="social-link" target="_blank" rel="noopener noreferrer" title="YouTube" aria-label="YouTube">
                <BsYoutube className="bi" />
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