import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-layout min-vh-100 bg-light">
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
                <span className="me-2">👤</span>
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

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2 d-md-block bg-white sidebar">
            <AdminSidebar />
          </div>
          
          {/* Main Content */}
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 