import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/Home';
import Noticia from './pages/Noticia';
import Categorias from './pages/Categorias';
import Busca from './pages/Busca';
import Sobre from './pages/Sobre';
import Contato from './pages/Contato';
import NotFound from './pages/NotFound';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';

// Painel admin carregado sob demanda: leitores do site não baixam esse código.
const AdminRoot = lazy(() => import('./admin/AdminRoot'));
const AdminLogin = lazy(() => import('./admin/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));
const AdminLayout = lazy(() => import('./admin/components/AdminLayout'));
const AdminNoticias = lazy(() => import('./admin/pages/AdminNoticias'));
const AdminEditarNoticia = lazy(() => import('./admin/pages/AdminEditarNoticia'));
const AdminNovaNoticia = lazy(() => import('./admin/pages/AdminNovaNoticia'));
const AdminCategorias = lazy(() => import('./admin/pages/AdminCategorias'));
const AdminConfiguracoes = lazy(() => import('./admin/pages/AdminConfiguracoes'));

import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/noticia/:slug" element={<Noticia />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categorias/:categoria" element={<Categorias />} />
            <Route path="/busca" element={<Busca />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Rotas administrativas */}
          <Route element={<Suspense fallback={null}><AdminRoot /></Suspense>}>
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
            <Route path="/admin/noticias/nova" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminNovaNoticia />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/categorias" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminCategorias />
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
                  <AdminConfiguracoes />
                </AdminLayout>
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
