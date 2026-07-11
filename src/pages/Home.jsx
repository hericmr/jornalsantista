import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PostItem from '../components/PostItem';
import { getAllPosts } from '../lib/postsService';
import { containsSearchTerm } from '../utils/textUtils';
import MetaTags from '../components/MetaTags';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter((post) =>
      post.title?.toLowerCase().includes(query.toLowerCase()) ||
      containsSearchTerm(post.text_content || post.content || '', query) ||
      post.author?.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredPosts(filtered);
  }, [query, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getAllPosts();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  const hero = filteredPosts.slice(0, 2);
  const rest = filteredPosts.slice(2);

  return (
    <>
      <MetaTags
        title="Jornal Santista - Notícias Locais e Regionais"
        description="Jornal Santista - Sua fonte de notícias locais e regionais. Fique por dentro das principais notícias da região."
        type="website"
        url={window.location.href}
      />

      <div className="shell">
        {query.trim() && (
          <p className="section-label">Resultados para "{query}"</p>
        )}

        {filteredPosts.length === 0 ? (
          <div className="text-center mt-5 mb-5">
            <h3>Nenhuma notícia encontrada</h3>
            <p className="text-muted">Tente ajustar os termos de busca.</p>
          </div>
        ) : (
          <>
            {hero.length > 0 && (
              <>
                <p className="section-label">Destaques</p>
                <div className="hero-row">
                  {hero.map((post) => (
                    <PostItem key={post.id} post={post} variant="hero" />
                  ))}
                </div>
              </>
            )}

            {rest.length > 0 && (
              <>
                <p className="section-label" style={{ marginTop: '46px' }}>Últimas notícias</p>
                <div className="feed-list">
                  {rest.map((post, idx) => (
                    <PostItem
                      key={post.id}
                      post={post}
                      variant={idx % 4 === 1 ? 'feature' : 'regular'}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Home;
