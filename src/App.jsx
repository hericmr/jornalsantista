import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Noticia from './pages/Noticia';
import Categorias from './pages/Categorias';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import AdminLayout from './admin/components/AdminLayout';
import AdminNoticias from './admin/pages/AdminNoticias';
import AdminEditarNoticia from './admin/pages/AdminEditarNoticia';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                <Home />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/noticia/:id" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                <Noticia />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/categorias" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                <Categorias />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/categorias/:categoria" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                <Categorias />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/sobre" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                <Sobre />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/contato" element={
            <div className="d-flex flex-column min-vh-100">
              <Header />
              <main className="flex-grow-1">
                <Contato />
              </main>
              <Footer />
            </div>
          } />

          {/* Rotas Administrativas */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/noticias" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminNoticias />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/noticias/editar/:id" element={
            <ProtectedRoute>
              <AdminLayout>
                <AdminEditarNoticia />
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/categorias" element={
            <ProtectedRoute>
              <AdminLayout>
                <div className="p-4">
                  <h2>Gerenciar Categorias</h2>
                  <p>Funcionalidade em desenvolvimento...</p>
                </div>
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/usuarios" element={
            <ProtectedRoute>
              <AdminLayout>
                <div className="p-4">
                  <h2>Gerenciar Usuários</h2>
                  <p>Funcionalidade em desenvolvimento...</p>
                </div>
              </AdminLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/configuracoes" element={
            <ProtectedRoute>
              <AdminLayout>
                <div className="p-4">
                  <h2>Configurações</h2>
                  <p>Funcionalidade em desenvolvimento...</p>
                </div>
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
