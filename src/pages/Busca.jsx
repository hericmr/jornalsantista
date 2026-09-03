import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PostItem from '../components/PostItem';
import MetaTags from '../components/MetaTags';
import { searchPosts } from '../lib/postsService';
import { SITE } from '../config/site';

const PAGE_SIZE = 12;

const Busca = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);

  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | loading | ready
  const [loadingMore, setLoadingMore] = useState(false);

  const runSearch = useCallback(async (term) => {
    if (!term.trim()) {
      setPosts([]);
      setTotal(0);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    const { posts: rows, total: count } = await searchPosts(term, { page: 0, pageSize: PAGE_SIZE });
    setPosts(rows);
    setTotal(count);
    setPage(0);
    setStatus('ready');
  }, []);

  useEffect(() => {
    setInput(query);
    runSearch(query);
  }, [query, runSearch]);

  const onSubmit = (e) => {
    e.preventDefault();
    const term = input.trim();
    setSearchParams(term ? { q: term } : {});
  };

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    const { posts: rows } = await searchPosts(query, { page: next, pageSize: PAGE_SIZE });
    setPosts((prev) => [...prev, ...rows]);
    setPage(next);
    setLoadingMore(false);
  };

  const hasMore = posts.length < total;

  return (
    <>
      <MetaTags
        title={query ? `Busca: ${query} — ${SITE.name}` : `Busca — ${SITE.name}`}
        description={`Resultados de busca no ${SITE.name}.`}
        url={typeof window !== 'undefined' ? window.location.href : undefined}
      />

      <div className="shell">
        <h1 className="h4 mb-3">Busca</h1>
        <form onSubmit={onSubmit} role="search" className="mb-4">
          <div className="input-group">
            <input
              type="search"
              className="form-control"
              placeholder="Buscar notícias, autores…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Termo de busca"
            />
            <button className="btn btn-dark" type="submit">Buscar</button>
          </div>
        </form>

        {status === 'loading' && (
          <div className="text-center my-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <>
            <p className="section-label">
              {total} {total === 1 ? 'resultado' : 'resultados'} para “{query}”
            </p>
            {posts.length === 0 ? (
              <div className="text-center my-5">
                <h3>Nada encontrado</h3>
                <p className="text-muted">Tente outras palavras ou termos mais gerais.</p>
                <Link to="/" className="btn btn-dark">Voltar para a Home</Link>
              </div>
            ) : (
              <>
                <div className="feed-list">
                  {posts.map((post) => (
                    <PostItem key={post.id} post={post} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-4">
                    <button className="btn btn-dark" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore ? 'Carregando…' : 'Carregar mais'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {status === 'idle' && (
          <p className="text-muted">Digite um termo para buscar.</p>
        )}
      </div>
    </>
  );
};

export default Busca;
