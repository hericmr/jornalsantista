import React from 'react';
import { Link } from 'react-router-dom';
import MetaTags from '../components/MetaTags';
import { SITE } from '../config/site';

const NotFound = () => {
  return (
    <>
      <MetaTags title={`Página não encontrada — ${SITE.name}`} />
      <div className="container mt-5 mb-5 text-center">
        <p className="section-label justify-content-center">Erro 404</p>
        <h1 className="display-5 fw-bold">Esta página não existe</h1>
        <p className="lead text-muted">
          O endereço pode ter mudado ou a notícia foi removida.
        </p>
        <Link to="/" className="btn btn-dark mt-2">
          Ir para a Home
        </Link>
      </div>
    </>
  );
};

export default NotFound;
