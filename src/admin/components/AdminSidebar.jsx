import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartBar, FaNewspaper, FaTags, FaCog } from 'react-icons/fa';

const AdminSidebar = () => {
  const menuItems = [
    {
      path: '/admin',
      label: 'Dashboard',
      icon: <FaChartBar />,
    },
    {
      path: '/admin/noticias',
      label: 'Notícias',
      icon: <FaNewspaper />,
    },
    {
      path: '/admin/categorias',
      label: 'Categorias',
      icon: <FaTags />,
    },
    {
      path: '/admin/configuracoes',
      label: 'Configurações',
      icon: <FaCog />,
    },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h5 className="mb-0">Administração</h5>
      </div>
      <nav className="sidebar-nav">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link d-flex align-items-center ${isActive ? 'active' : ''}`
                }
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar; 