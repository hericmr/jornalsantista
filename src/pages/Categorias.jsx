import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostItem from '../components/PostItem';
import MetaTags from '../components/MetaTags';
import { getAllPosts } from '../lib/postsService';
import { SITE } from '../config/site';

const Categorias = () => {
  const { categoria } = useParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let active = true;

    const load = async () => {
      setStatus('loading');
      try {
        const data = await getAllPosts();
        if (!active) return;
        setPosts(data);
        const uniqueCategories = [
          ...new Set(data.flatMap((post) => post.categories || []))
        ].sort((a, b) => a.localeCompare(b, 'pt-BR'));
        setCategories(uniqueCategories);
        setStatus('ready');
      } catch (error) {
        if (!active) return;
        console.error('Erro ao carregar categorias:', error);
        setStatus('error');
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredPosts = categoria
    ? posts.filter((post) => (post.categories || []).includes(categoria))
    : posts;

  if (status === 'loading') {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mt-5 text-center">
        <h3>Não foi possível carregar as notícias</h3>
        <p className="text-muted">Verifique sua conexão e tente novamente.</p>
        <button className="btn btn-dark" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title={
          categoria ? `${categoria} — ${SITE.name}` : `Editorias — ${SITE.name}`
        }
        description={
          categoria
            ? `Notícias e artigos sobre ${categoria} no ${SITE.name}.`
            : `Navegue por todas as editorias do ${SITE.name}.`
        }
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />

      <div className="container mt-4 mb-5">
        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Editorias</h5>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <Link
                    to="/categorias"
                    className={`list-group-item list-group-item-action ${!categoria ? 'active' : ''}`}
                  >
                    Todas
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat}
                      to={`/categorias/${encodeURIComponent(cat)}`}
                      className={`list-group-item list-group-item-action ${categoria === cat ? 'active' : ''}`}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">{categoria ? categoria : 'Todas as editorias'}</h2>
              <span className="text-muted">
                {filteredPosts.length}{' '}
                {filteredPosts.length === 1 ? 'notícia' : 'notícias'}
              </span>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center mt-5">
                <h3>Nenhuma notícia encontrada</h3>
                <p className="text-muted">
                  {categoria
                    ? `Ainda não há notícias em "${categoria}".`
                    : 'Não há notícias disponíveis.'}
                </p>
                <Link to="/" className="btn btn-dark">
                  Voltar para a Home
                </Link>
              </div>
            ) : (
              <div className="feed-list">
                {filteredPosts.map((post) => (
                  <PostItem key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Categorias;
