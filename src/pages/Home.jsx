import React, { useState, useEffect, useCallback } from 'react';
import PostItem from '../components/PostItem';
import { getPostsPage } from '../lib/postsService';
import MetaTags from '../components/MetaTags';
import JsonLd from '../components/JsonLd';
import { organizationSchema, websiteSchema } from '../lib/structuredData';

const PAGE_SIZE = 12;

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFirstPage = useCallback(async () => {
    setStatus('loading');
    const { posts: rows, hasMore: more, ok } = await getPostsPage({ page: 0, pageSize: PAGE_SIZE });
    if (!ok) {
      setStatus('error');
      return;
    }
    setPosts(rows);
    setHasMore(more);
    setPage(0);
    setStatus('ready');
  }, []);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);
    const { posts: rows, hasMore: more } = await getPostsPage({ page: next, pageSize: PAGE_SIZE });
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
        <button className="btn btn-dark" onClick={loadFirstPage}>
          Tentar novamente
        </button>
      </div>
    );
  }

  const hero = posts.slice(0, 2);
  const rest = posts.slice(2);

  return (
    <>
      <MetaTags
        title="Jornal Santista – Mídia alternativa na Baixada"
        description="Mídia independente com olhar crítico sobre a Baixada Santista. Informação com opinião, denúncias, cultura e debate sob a ótica dos trabalhadores."
        type="website"
        url={window.location.href}
      />
      <JsonLd data={[organizationSchema(), websiteSchema()]} />

      {hero.length > 0 && (
        <section className="hero-band">
          <div className="hero-band-inner">
            <div className="hero-row">
              {hero.map((post) => (
                <PostItem key={post.id} post={post} variant="hero" />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="shell">
        {posts.length === 0 ? (
          <div className="text-center mt-5 mb-5">
            <h3>Nenhuma notícia publicada ainda</h3>
          </div>
        ) : (
          <>
            {rest.length > 0 && (
              <div className="feed-list">
                {rest.map((post, idx) => (
                  <PostItem
                    key={post.id}
                    post={post}
                    variant={idx % 4 === 1 ? 'feature' : 'regular'}
                  />
                ))}
              </div>
            )}

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
    </>
  );
};

export default Home;
