import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminFeedbackProvider } from './components/AdminFeedback';

// Raiz das rotas /admin. Fica num chunk separado (carregado via React.lazy em
// App.jsx) para que o código do painel não entre no bundle do site público.

export const AdminFallback = () => (
  <div className="container mt-5">
    <div className="text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Carregando...</span>
      </div>
    </div>
  </div>
);

const AdminRoot = () => (
  <AdminFeedbackProvider>
    <Suspense fallback={<AdminFallback />}>
      <Outlet />
    </Suspense>
  </AdminFeedbackProvider>
);

export default AdminRoot;
