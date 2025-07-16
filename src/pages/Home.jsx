import React, { useState, useEffect } from 'react';
import PostItem from '../components/PostItem';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/blog_posts.json');
      const data = await response.json();
      
      // Ordenar por data de publicação (mais recentes primeiro)
      const sortedPosts = data.sort((a, b) => 
        new Date(b.published) - new Date(a.published)
      );
      
      setPosts(sortedPosts);
      setFilteredPosts(sortedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.text_content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredPosts(filtered);
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

  const featuredPost = filteredPosts[0];
  const otherPosts = filteredPosts.slice(1, 7); // Limitar a 6 notícias secundárias
  const remainingPosts = filteredPosts.slice(7);

  return (
    <div className="container-fluid mt-4">
      {/* Barra de busca */}
      <div className="row mb-4">
        <div className="col-lg-8 mx-auto">
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      
      {filteredPosts.length === 0 ? (
        <div className="text-center mt-5">
          <h3>Nenhuma notícia encontrada</h3>
          <p className="text-muted">Tente ajustar os termos de busca.</p>
        </div>
      ) : (
        <>
          {/* Matéria em Destaque */}
          {featuredPost && (
            <div className="row mb-5">
              <div className="col-12">
                <div className="border-bottom pb-3 mb-4">
                  <h2 className="text-uppercase fw-bold text-dark">
                    <i className="bi bi-star-fill text-warning me-2"></i>
                    Destaque
                  </h2>
                </div>
                <div className="card shadow-lg border-0">
                  <div className="row g-0">
                    {featuredPost.images && featuredPost.images.length > 0 && (
                      <div className="col-lg-6">
                        <img 
                          src={featuredPost.images[0]} 
                          className="img-fluid rounded-start h-100 object-fit-cover" 
                          alt={featuredPost.title}
                          style={{ minHeight: '400px' }}
                        />
                      </div>
                    )}
                    <div className={featuredPost.images && featuredPost.images.length > 0 ? 'col-lg-6' : 'col-12'}>
                      <div className="card-body p-4">
                        <div className="mb-3">
                          {featuredPost.categories && featuredPost.categories.length > 0 ? (
                            featuredPost.categories.map((category, index) => (
                              <span key={index} className="badge bg-primary me-1 mb-2">
                                {category}
                              </span>
                            ))
                          ) : (
                            <span className="badge bg-secondary me-1 mb-2">Sem categoria</span>
                          )}
                        </div>
                        <h1 className="card-title display-6 fw-bold mb-3">
                          {featuredPost.title}
                        </h1>
                        <p className="card-text lead text-muted mb-4">
                          {featuredPost.text_content.substring(0, 300)}...
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="text-muted">
                            <div className="fw-semibold">
                              <i className="bi bi-person me-1"></i>
                              {featuredPost.author}
                            </div>
                            <small>
                              <i className="bi bi-calendar3 me-1"></i>
                              {new Date(featuredPost.published).toLocaleDateString('pt-BR')}
                            </small>
                          </div>
                          <a href={`/noticia/${featuredPost.id}`} className="btn btn-dark btn-lg">
                            <i className="bi bi-arrow-right me-1"></i>
                            Ler mais
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Últimas Notícias */}
          {otherPosts.length > 0 && (
            <div className="row mb-5">
              <div className="col-12">
                <div className="border-bottom pb-3 mb-4">
                  <h2 className="text-uppercase fw-bold text-dark">
                    <i className="bi bi-clock me-2"></i>
                    Últimas Notícias
                  </h2>
                </div>
                <div className="row">
                  {otherPosts.map((post, index) => (
                    <div key={post.id} className={index < 2 ? 'col-lg-6 mb-4' : 'col-lg-4 mb-4'}>
                      <PostItem post={post} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mais Notícias */}
          {remainingPosts.length > 0 && (
            <div className="row">
              <div className="col-12">
                <div className="border-bottom pb-3 mb-4">
                  <h3 className="text-uppercase fw-bold text-dark">
                    <i className="bi bi-newspaper me-2"></i>
                    Mais Notícias
                  </h3>
                </div>
                <div className="row">
                  {remainingPosts.map(post => (
                    <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                      <PostItem post={post} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home; 