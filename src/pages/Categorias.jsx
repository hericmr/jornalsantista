import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostItem from '../components/PostItem';
import MetaTags from '../components/MetaTags';
import { getCategoryNames, getPostsByCategory, getPostsPage } from '../lib/postsService';
import { SITE } from '../config/site';

const PAGE_SIZE = 20;

const Categorias = () => {
  const { categoria } = useParams();
  const [categories, setCategories] = useState([]);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let active = true;
    getCategoryNames().then((names) => {
      if (active) setCategories(names);
    });
    return () => {
      active = false;
    };
  }, []);

  // "Todas" usa o feed geral; uma editoria filtra por categoria.
  const fetchPage = useCallback(
    (n) =>
      categoria
        ? getPostsByCategory(categoria, { page: n, pageSize: PAGE_SIZE })
        : getPostsPage({ page: n, pageSize: PAGE_SIZE }),
    [categoria]
  );

  useEffect(() => {
    let active = true;
    setStatus('loading');
    fetchPage(0).then(({ posts: rows, hasMore: more, ok }) => {
      if (!active) return;
      setPosts(rows);
      setHasMore(more);
      setPage(0);
      setStatus(ok ? 'ready' : 'error');
    });
    return () => {
      active = false;
    };
  }, [fetchPage]);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    const { posts: rows, hasMore: more } = await fetchPage(next);
    setPosts((prev) => [...prev, ...rows]);
    setHasMore(more);
    setPage(next);
    setLoadingMore(false);
  };

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
        title={categoria ? `${categoria} — ${SITE.name}` : `Editorias — ${SITE.name}`}
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
              <h1 className="h3 mb-0">{categoria ? categoria : 'Todas as editorias'}</h1>
              <span className="text-muted">
                {posts.length}
                {hasMore ? '+' : ''} {posts.length === 1 && !hasMore ? 'notícia' : 'notícias'}
              </span>
            </div>

            {posts.length === 0 ? (
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
              <>
                <div className="feed-list">
                  {posts.map((post) => (
                    <PostItem key={post.id} post={post} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-4 mb-2">
                    <button className="btn btn-dark" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore ? 'Carregando…' : 'Carregar mais'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Categorias;
