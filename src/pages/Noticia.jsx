import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const Noticia = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch('/blog_posts.json');
      const data = await response.json();
      const foundPost = data.find(p => p.id === id);
      setPost(foundPost);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!post) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <h3>Notícia não encontrada</h3>
          <Link to="/" className="btn btn-dark">
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      <article>
        <header className="mb-4">
          <h1 className="display-5 fw-bold">{post.title}</h1>
          
          <div className="d-flex justify-content-between align-items-center text-muted mb-3">
            <div>
              <span>Por {post.author}</span>
              <br />
              <span>Publicado em {formatDate(post.published)}</span>
              {post.updated && post.updated !== post.published && (
                <>
                  <br />
                  <span>Atualizado em {formatDate(post.updated)}</span>
                </>
              )}
            </div>
            <div>
              {post.categories && post.categories.length > 0 ? (
                post.categories.map((category, index) => (
                  <span key={index} className="badge bg-secondary me-1">
                    {category}
                  </span>
                ))
              ) : (
                <span className="badge bg-light text-dark">Sem categoria</span>
              )}
            </div>
          </div>
        </header>

        {/* Imagem de Destaque */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <img 
              src={post.images[0]} 
              className="img-fluid rounded shadow" 
              alt={post.title}
            />
          </div>
        )}

        {/* Conteúdo do Texto */}
        <div className="article-content">
          {post.text_content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-3">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Galeria de Imagens */}
        {post.images && post.images.length > 1 && (
          <div className="mt-5">
            <h4>Galeria de Imagens</h4>
            <div className="row">
              {post.images.slice(1).map((image, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <img 
                    src={image} 
                    className="img-fluid rounded shadow-sm" 
                    alt={`${post.title} - Imagem ${index + 2}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 pt-4 border-top">
          <Link to="/" className="btn btn-dark">
            ← Voltar para Home
          </Link>
        </div>
      </article>
    </div>
  );
};

export default Noticia; 