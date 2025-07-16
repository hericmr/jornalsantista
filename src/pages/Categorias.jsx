import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PostItem from '../components/PostItem';

const Categorias = () => {
  const { categoria } = useParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      filterPostsByCategory();
    }
  }, [categoria, posts]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/blog_posts.json');
      const data = await response.json();
      
      // Ordenar por data de publicação (mais recentes primeiro)
      const sortedPosts = data.sort((a, b) => 
        new Date(b.published) - new Date(a.published)
      );
      
      setPosts(sortedPosts);
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(
        data.flatMap(post => post.categories || [])
      )].sort();
      
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setLoading(false);
    }
  };

  const filterPostsByCategory = () => {
    if (!categoria) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.categories && post.categories.includes(categoria)
      );
      setFilteredPosts(filtered);
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

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Sidebar com Categorias */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Categorias</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <Link 
                  to="/categorias" 
                  className={`list-group-item list-group-item-action ${!categoria ? 'active' : ''}`}
                >
                  Todas as Categorias
                </Link>
                {categories.map(cat => (
                  <Link 
                    key={cat} 
                    to={`/categorias/${cat}`} 
                    className={`list-group-item list-group-item-action ${categoria === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Posts */}
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              {categoria ? `Categoria: ${categoria}` : 'Todas as Categorias'}
            </h2>
            <span className="text-muted">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'notícia' : 'notícias'}
            </span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-center mt-5">
              <h3>Nenhuma notícia encontrada</h3>
              <p className="text-muted">
                {categoria 
                  ? `Não há notícias na categoria "${categoria}"`
                  : 'Não há notícias disponíveis'
                }
              </p>
              <Link to="/" className="btn btn-dark">
                Voltar para Home
              </Link>
            </div>
          ) : (
            <div>
              {filteredPosts.map(post => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categorias; 