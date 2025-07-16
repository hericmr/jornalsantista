import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import AdminSidebar from './AdminSidebar';
import { FaUser } from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <div className="navbar-brand d-flex align-items-center">
            <div>
              <div className="fw-bold fs-5" style={{ letterSpacing: '1px' }}>
                JORNAL SANTISTA
              </div>
              <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>
                Painel Administrativo
              </small>
            </div>
          </div>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <a className="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                <span className="me-2"><FaUser /></span>
                {user?.name || user?.username}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><span className="dropdown-item-text text-muted">Logado como: {user?.username}</span></li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item" onClick={handleLogout}>Sair</button></li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="d-flex">
        {/* Sidebar */}
        <AdminSidebar />
        
        {/* Main Content */}
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 