import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaSearch, FaBars, FaTimes } from 'react-icons/fa';
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

  const closeMenu = () => setMenuOpen(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    navigate(term ? `/?q=${encodeURIComponent(term)}` : '/');
  };

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
            <Link to="/" className="brand-name">Jornal Santista</Link>
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
            <a href={SITE.social.instagram} className="social-text" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={`mailto:${SITE.email}`} className="social-text">Contato</a>
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
