import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes, FaInstagram } from 'react-icons/fa';
import { SITE } from '../config/site';

const navLinks = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/categorias', label: 'Artigos' },
  { to: '/contato', label: 'Contato' }
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const closeMenu = () => setMenuOpen(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    closeMenu();
    navigate(term ? `/busca?q=${encodeURIComponent(term)}` : '/busca');
  };

  // Na home o nome do jornal é o título da página (único <h1>); nas demais
  // o <h1> fica com o título da matéria/seção.
  const brand = <Link to="/" className="brand-name">Jornal Santista</Link>;

  return (
    <>
      <header className="masthead">
        <div className="masthead-inner">
          <div className="masthead-left">
            <button
              className="burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
            >
              <FaBars />
            </button>
            {pathname === '/' ? <h1 className="brand-heading">{brand}</h1> : brand}
          </div>

          <form className="header-search" onSubmit={handleSearchSubmit} role="search">
            <span className="header-search-icon"><FaSearch /></span>
            <input
              type="text"
              placeholder="Buscar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar notícias"
            />
          </form>

          <div className="masthead-right">
            <a href={SITE.social.instagram} className="social-icon" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram />
            </a>
            <Link to="/contato" className="social-text">Contato</Link>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div className="menu-overlay" onClick={closeMenu} />
          <div className="menu-sidebar">
            <div className="menu-header d-flex justify-content-between align-items-center p-3">
              <span className="brand-name" style={{ fontSize: '1rem' }}>Menu</span>
              <button className="mobile-menu-toggle" onClick={closeMenu} aria-label="Fechar menu">
                <FaTimes />
              </button>
            </div>
            {/* no celular a busca do cabeçalho some; aqui ela continua acessível */}
            <form className="header-search menu-search" onSubmit={handleSearchSubmit} role="search">
              <span className="header-search-icon"><FaSearch /></span>
              <input
                type="search"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar notícias"
              />
            </form>
            <nav className="menu-content px-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className="nav-link d-block"
                  onClick={closeMenu}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
