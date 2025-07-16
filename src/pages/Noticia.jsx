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

  const shareOnSocialMedia = (platform) => {
    const url = window.location.href;
    const title = post?.title || 'Jornal Santista';
    const text = post?.text_content?.substring(0, 100) || '';

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title} - ${text} ${url}`)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
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
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          {post.categories && post.categories.length > 0 && (
            <li className="breadcrumb-item">
              <Link to={`/categorias/${post.categories[0]}`} className="text-decoration-none">
                {post.categories[0]}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {post.title}
          </li>
        </ol>
      </nav>

      <article className="row">
        {/* Conteúdo Principal */}
        <div className="col-lg-8">
          {/* Header da Notícia */}
          <header className="mb-4">
            {/* Categorias */}
            <div className="mb-3">
              {post.categories && post.categories.length > 0 ? (
                post.categories.map((category, index) => (
                  <Link 
                    key={index} 
                    to={`/categorias/${category}`} 
                    className="badge bg-primary me-1 text-decoration-none"
                  >
                    {category}
                  </Link>
                ))
              ) : (
                <span className="badge bg-secondary">Sem categoria</span>
              )}
            </div>

            {/* Título */}
            <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.2' }}>
              {post.title}
            </h1>

            {/* Meta informações */}
            <div className="d-flex flex-wrap justify-content-between align-items-center text-muted mb-4">
              <div>
                <div className="fw-semibold mb-1">
                  Por {post.author}
                </div>
                <div className="small">
                  Publicado em {formatDate(post.published)}
                </div>
                {post.updated && post.updated !== post.published && (
                  <div className="small">
                    Atualizado em {formatDate(post.updated)}
                  </div>
                )}
              </div>
              
              {/* Botões de compartilhamento */}
              <div className="d-flex gap-2">
                <button 
                  onClick={() => shareOnSocialMedia('whatsapp')}
                  className="btn btn-outline-success btn-sm"
                  title="Compartilhar no WhatsApp"
                >
                  WhatsApp
                </button>
                <button 
                  onClick={() => shareOnSocialMedia('facebook')}
                  className="btn btn-outline-primary btn-sm"
                  title="Compartilhar no Facebook"
                >
                  Facebook
                </button>
                <button 
                  onClick={() => shareOnSocialMedia('twitter')}
                  className="btn btn-outline-info btn-sm"
                  title="Compartilhar no Twitter"
                >
                  Twitter
                </button>
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
                style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
              />
              {post.images.length > 1 && (
                <small className="text-muted d-block mt-2">
                  Imagem 1 de {post.images.length}
                </small>
              )}
            </div>
          )}

          {/* Conteúdo do Texto */}
          <div className="article-content mb-5">
            {post.text_content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Galeria de Imagens */}
          {post.images && post.images.length > 1 && (
            <div className="mb-5">
              <h4 className="mb-3">Galeria de Imagens</h4>
              <div className="row">
                {post.images.slice(1).map((image, index) => (
                  <div key={index} className="col-md-6 col-lg-4 mb-3">
                    <img 
                      src={image} 
                      className="img-fluid rounded shadow-sm" 
                      alt={`${post.title} - Imagem ${index + 2}`}
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags e Categorias */}
          <div className="mb-4">
            <h5>Tags:</h5>
            <div>
              {post.categories && post.categories.length > 0 ? (
                post.categories.map((category, index) => (
                  <Link 
                    key={index} 
                    to={`/categorias/${category}`} 
                    className="badge bg-light text-dark me-1 mb-1 text-decoration-none"
                  >
                    #{category}
                  </Link>
                ))
              ) : (
                <span className="text-muted">Nenhuma tag disponível</span>
              )}
            </div>
          </div>

          {/* Navegação */}
          <div className="border-top pt-4">
            <Link to="/" className="btn btn-dark">
              ← Voltar para Home
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          <div className="sticky-top" style={{ top: '2rem' }}>
            {/* Informações do Autor */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Sobre o Autor</h5>
                <p className="card-text">
                  <strong>{post.author}</strong>
                </p>
                <p className="card-text text-muted small">
                  Jornalista do Jornal Santista
                </p>
              </div>
            </div>

            {/* Compartilhar */}
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Compartilhar</h5>
                <div className="d-grid gap-2">
                  <button 
                    onClick={() => shareOnSocialMedia('whatsapp')}
                    className="btn btn-success btn-sm"
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => shareOnSocialMedia('facebook')}
                    className="btn btn-primary btn-sm"
                  >
                    Facebook
                  </button>
                  <button 
                    onClick={() => shareOnSocialMedia('twitter')}
                    className="btn btn-info btn-sm"
                  >
                    Twitter
                  </button>
                  <button 
                    onClick={() => shareOnSocialMedia('telegram')}
                    className="btn btn-secondary btn-sm"
                  >
                    Telegram
                  </button>
                </div>
              </div>
            </div>

            {/* Informações da Matéria */}
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Informações</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <small className="text-muted">Publicado:</small><br />
                    {formatDate(post.published)}
                  </li>
                  {post.updated && post.updated !== post.published && (
                    <li className="mb-2">
                      <small className="text-muted">Atualizado:</small><br />
                      {formatDate(post.updated)}
                    </li>
                  )}
                  <li className="mb-2">
                    <small className="text-muted">Autor:</small><br />
                    {post.author}
                  </li>
                  {post.categories && post.categories.length > 0 && (
                    <li>
                      <small className="text-muted">Categorias:</small><br />
                      {post.categories.join(', ')}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Noticia; 