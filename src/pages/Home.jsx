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
  const otherPosts = filteredPosts.slice(1);

  return (
    <div className="container mt-4">
      <SearchBar onSearch={handleSearch} />
      
      {filteredPosts.length === 0 ? (
        <div className="text-center mt-5">
          <h3>Nenhuma notícia encontrada</h3>
          <p className="text-muted">Tente ajustar os termos de busca.</p>
        </div>
      ) : (
        <>
          {/* Matéria em Destaque */}
          {featuredPost && (
            <div className="mb-5">
              <h2 className="mb-4">Destaque</h2>
              <div className="card shadow-lg">
                <div className="row g-0">
                  {featuredPost.images && featuredPost.images.length > 0 && (
                    <div className="col-md-6">
                      <img 
                        src={featuredPost.images[0]} 
                        className="img-fluid rounded-start h-100 object-fit-cover" 
                        alt={featuredPost.title}
                        style={{ minHeight: '300px' }}
                      />
                    </div>
                  )}
                  <div className={featuredPost.images && featuredPost.images.length > 0 ? 'col-md-6' : 'col-md-12'}>
                    <div className="card-body">
                      <h3 className="card-title">{featuredPost.title}</h3>
                      <p className="card-text text-muted">
                        {featuredPost.text_content.substring(0, 300)}...
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="text-muted">
                          <span>Por {featuredPost.author}</span>
                          <br />
                          <span>{new Date(featuredPost.published).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <a href={`/noticia/${featuredPost.id}`} className="btn btn-dark">
                          Ler mais
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Outras Notícias */}
          {otherPosts.length > 0 && (
            <div>
              <h2 className="mb-4">Últimas Notícias</h2>
              {otherPosts.map(post => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home; 