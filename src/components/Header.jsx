import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';
import SearchBar from './SearchBar';
import 'bootstrap/dist/css/bootstrap.min.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navLinks = [
    { to: '/', label: 'Início' },
    { to: '/sobre', label: 'Sobre' },
    { 
      label: 'Artigos',
      children: [
        { to: '/categorias', label: 'Todos Artigos' },
        { to: '/categorias', label: 'Por Categoria' }
      ]
    },
    { to: '/contato', label: 'Contato' }
  ];

  const closeMenu = () => {
    setMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <>
      <header className="site-header">
        {/* Logo Section - Top, Black Background, Centered */}
        <div className="header-logo-section">
          <div className="header-container">
            <Link to="/" className="logo-link">
              <span className="journal-title">Jornal Santista</span>
              <span className="journal-subtitle">Mídia alternativa na Baixada</span>
            </Link>
          </div>
        </div>

        {/* Navigation Section - Bottom, White Background */}
        <div className="header-nav-section">
          <div className="header-container">
            {/* Desktop Navigation */}
            <nav className="header-nav desktop-nav">
              <ul className="nav-menu">
                {navLinks.map((link, index) => (
                  <li key={index} className={`menu-item ${link.children ? 'menu-item-has-children' : ''}`}>
                    {link.children ? (
                      <>
                        <a 
                          href="#" 
                          className="elementor-item elementor-item-anchor"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleDropdown(index);
                          }}
                        >
                          {link.label}
                          <FaChevronDown className="dropdown-icon" />
                        </a>
                        {activeDropdown === index && (
                          <ul className="sub-menu">
                            {link.children.map((child, childIndex) => (
                              <li key={childIndex} className="menu-item">
                                <NavLink 
                                  to={child.to} 
                                  className="elementor-sub-item"
                                  onClick={closeMenu}
                                >
                                  {child.label}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <NavLink
                        to={link.to}
                        className={({ isActive }) =>
                          `elementor-item ${isActive ? 'elementor-item-active' : ''}`
                        }
                      >
                        {link.label}
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Alternar menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {menuOpen && (
            <nav className="header-nav mobile-nav">
              <div className="header-container">
                <ul className="nav-menu">
                  {navLinks.map((link, index) => (
                    <li key={index} className={`menu-item ${link.children ? 'menu-item-has-children' : ''}`}>
                      {link.children ? (
                        <>
                          <a 
                            href="#" 
                            className="elementor-item"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleDropdown(index);
                            }}
                          >
                            {link.label}
                            <FaChevronDown className={`dropdown-icon ${activeDropdown === index ? 'rotated' : ''}`} />
                          </a>
                          {activeDropdown === index && (
                            <ul className="sub-menu">
                              {link.children.map((child, childIndex) => (
                                <li key={childIndex} className="menu-item">
                                  <NavLink 
                                    to={child.to} 
                                    className="elementor-sub-item"
                                    onClick={closeMenu}
                                  >
                                    {child.label}
                                  </NavLink>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <NavLink
                          to={link.to}
                          className={({ isActive }) =>
                            `elementor-item ${isActive ? 'elementor-item-active' : ''}`
                          }
                          onClick={closeMenu}
                        >
                          {link.label}
                        </NavLink>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header; 