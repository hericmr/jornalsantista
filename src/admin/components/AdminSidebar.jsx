import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin',
      icon: '📊',
      label: 'Dashboard',
      description: 'Visão geral'
    },
    {
      path: '/admin/noticias',
      icon: '📰',
      label: 'Notícias',
      description: 'Gerenciar notícias'
    },
    {
      path: '/admin/categorias',
      icon: '🏷️',
      label: 'Categorias',
      description: 'Gerenciar categorias'
    },
    {
      path: '/admin/usuarios',
      icon: '👥',
      label: 'Usuários',
      description: 'Gerenciar administradores'
    },
    {
      path: '/admin/configuracoes',
      icon: '⚙️',
      label: 'Configurações',
      description: 'Configurações do site'
    }
  ];

  return (
    <div className="sidebar-sticky pt-3">
      <ul className="nav flex-column">
        {menuItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link d-flex align-items-center ${
                location.pathname === item.path ? 'active bg-primary text-white' : 'text-dark'
              }`}
            >
              <span className="me-3" style={{ fontSize: '1.2rem' }}>
                {item.icon}
              </span>
              <div>
                <div className="fw-semibold">{item.label}</div>
                <small className={`${location.pathname === item.path ? 'text-white-50' : 'text-muted'}`}>
                  {item.description}
                </small>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <hr className="my-3" />
      
      <div className="px-3">
        <Link to="/" className="btn btn-outline-secondary btn-sm w-100">
          ← Voltar ao Site
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar; 