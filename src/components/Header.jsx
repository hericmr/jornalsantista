import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaSearch, FaTimes } from 'react-icons/fa';
import SearchBar from './SearchBar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/categorias', label: 'Categorias' },
    { to: '/sobre', label: 'Sobre' },
    { to: '/contato', label: 'Contato' }
  ];

  const closeMenu = () => {
    setMenuOpen(false);
    setShowSearch(false);
  };

  return (
    <>
      <header className="header-intercept shadow-sm bg-dark border-bottom">
        <nav className="container d-flex align-items-center justify-content-between py-2">
          {/* Logo */}
          <Link to="/" className="navbar-brand d-flex align-items-center p-0 m-0">
            <span className="fw-bold fs-2 journal-title text-uppercase" style={{ letterSpacing: '2px', fontFamily: 'Merriweather, serif' }}>
              Jornal Santista
            </span>
          </Link>
          
          {/* Botão do menu */}
          <button
            className="btn border-0 bg-transparent text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menu"
          >
            <FaBars size={24} />
          </button>
        </nav>
      </header>

      {/* Menu lateral */}
      {menuOpen && (
        <div className="menu-overlay" onClick={closeMenu}>
          <div className="menu-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="menu-header d-flex justify-content-between align-items-center p-3">
              <h5 className="mb-0 text-white">Menu</h5>
              <button
                className="btn border-0 bg-transparent text-white"
                onClick={closeMenu}
                aria-label="Fechar menu"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="menu-content p-3">
              {/* Busca */}
              <div className="mb-4">
                <SearchBar onSearch={() => {}} />
              </div>
              
              {/* Navegação */}
              <ul className="nav flex-column">
                {navLinks.map(link => (
                  <li key={link.to} className="nav-item">
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `nav-link text-uppercase fw-semibold py-2${isActive ? ' active' : ''}`
                      }
                      style={{ letterSpacing: '1px', fontSize: '1rem' }}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header; 