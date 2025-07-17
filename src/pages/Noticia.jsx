import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostById } from '../lib/postsService';
import { stripHtml, processHtmlContent, createExcerpt, getFullImageUrl } from '../utils/textUtils';
import MetaTags from '../components/MetaTags';
import NewsletterModal from '../components/NewsletterModal';

const Noticia = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    fetchPost();
    // Controle de leitura de matérias
    const key = 'noticias_lidas';
    let count = parseInt(localStorage.getItem(key) || '0', 10);
    count += 1;
    localStorage.setItem(key, count);
    if (count === 2) setShowNewsletter(true);
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const foundPost = await getPostById(slug);
      console.log('📰 Noticia: Post carregado:', {
        id: foundPost?.id,
        title: foundPost?.title,
        hasTextContent: !!foundPost?.text_content,
        textContentLength: foundPost?.text_content?.length || 0,
        source: foundPost?.source
      });
      setPost(foundPost);
    } catch (error) {
      console.error('Erro ao carregar post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data não disponível';
    }
  };

  const shareOnSocialMedia = (platform) => {
    const url = window.location.href;
    const title = post?.title || 'Jornal Santista';
    const text = stripHtml(post?.text_content || post?.content || '').substring(0, 100);

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

  const handleImageError = (e) => {
    // Se a imagem falhar ao carregar, substitui por um placeholder
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGRpc3BvbsOtdmVsPC90ZXh0Pjwvc3ZnPg==';
    e.target.style.objectFit = 'cover';
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

  // Antes do render
  let images = post.images;
  if (!images) {
    images = [];
  } else if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
      if (!Array.isArray(images)) images = [images];
    } catch {
      images = images ? [images] : [];
    }
  } else if (!Array.isArray(images)) {
    images = [images];
  }
  images = images.filter(Boolean).map(url => url && typeof url === 'string' ? getFullImageUrl(url) : url);

  return (
    <>
      {showNewsletter && <NewsletterModal onClose={() => setShowNewsletter(false)} />}
      {/* Meta Tags para SEO e compartilhamento */}
      <MetaTags
        title={post?.title || 'Notícia - Jornal Santista'}
        description={post?.excerpt || createExcerpt(post?.text_content || post?.content || '', 160)}
        image={post?.images && post.images.length > 0 ? getFullImageUrl(post.images[0]) : null}
        url={window.location.href}
        type="article"
        author={post?.author}
        publishedTime={post?.published}
        modifiedTime={post?.updated}
      />
      
      <div className="container mt-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
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
              {post.title || 'Notícia'}
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
                {post.title || 'Título não disponível'}
              </h1>

              {/* Meta informações */}
              <div className="d-flex flex-wrap justify-content-between align-items-center text-muted mb-4">
                <div>
                  <div className="fw-semibold mb-1">
                    Por {post.author || 'Autor não informado'}
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

            {/* Imagem principal do bucket (galeria/thumbnail) */}
            {images.length > 0 && (
              <div className="mb-4">
                <figure className="mb-3 text-center">
                  <img
                    src={images[0]}
                    className="img-fluid rounded shadow-lg"
                    alt={`${post.title || 'Notícia'} - Imagem 1`}
                    title={post.title || 'Notícia'}
                    style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
                    onError={handleImageError}
                    loading="lazy"
                  />
                </figure>
              </div>
            )}

            {/* Texto da matéria */}
            <div className="article-content mb-5">
              {(post.text_content || post.content) ? (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: processHtmlContent(post.text_content || post.content) 
                  }} 
                />
              ) : (
                <p className="text-muted">Conteúdo não disponível.</p>
              )}
            </div>

            {/* Imagens extras após o texto */}
            {images.length > 1 && (
              <div className="mb-4">
                {images.slice(1).map((image, idx) => (
                  <figure key={idx + 1} className="mb-3 text-center">
                    <img
                      src={image}
                      className="img-fluid rounded shadow-lg"
                      alt={`${post.title || 'Notícia'} - Imagem ${idx + 2}`}
                      title={post.title || 'Notícia'}
                      style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
                      onError={handleImageError}
                      loading="lazy"
                    />
                  </figure>
                ))}
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
              <div className="card mb-4 bg-dark text-light border-secondary">
                <div className="card-body">
                  {/* Removido o título 'Sobre o Autor' */}
                  {post.author === "Héric Moura" && (
                    <>
                      <div className="text-center mb-3">
                        <img
                          src="https://hericmr.github.io/me/imagens/heric.png"
                          alt="Héric Moura"
                          style={{ width: '160px', borderRadius: '50%', filter: 'grayscale(1)', background: '#222' }}
                          className="mb-2 shadow"
                        />
                      </div>
                      <p className="card-text mb-1">
                        <strong>Héric Moura</strong>
                      </p>
                      <p className="card-text small mb-0">
                        Integrante da equipe do Jornal Santista desde 2015. Atua na cobertura de temas ligados a meio ambiente, movimentos sociais, cultura e política local, com atenção especial às pautas que afetam diretamente a vida da população trabalhadora da região.
                      </p>
                    </>
                  )}
                  {post.author === "Walter Parreira" && (
                    <>
                      <div className="text-center mb-3">
                        <img
                          src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjq8IpFqpYweRnLpCzLH8szo7Qw6VkhIFSWX92iTLn8S9dWe-gODvCpBa2aby9B-2Wo2KjUxTthS9BRsy9ZDbFRyYk3PxxHrFy50NqMKqfw2qbhUGW6IvhHsPeD3zHu1nzg329NOSk9n4OX5Wa2N8HC4OFmM5q0r3-hWT5-ple6N7NE7CGTklyRzYu-/w200-h200/servletrecuperafoto.gif"
                          alt="Walter Parreira"
                          style={{ width: '160px', borderRadius: '50%', filter: 'grayscale(1)', background: '#222' }}
                          className="mb-2 shadow"
                        />
                      </div>
                      <p className="card-text mb-1">
                        <strong>Walter Parreira</strong>
                      </p>
                      <p className="card-text small mb-0">
                        Jornalista do Jornal Santista. Especialista em temas sociais, cultura e história regional, com olhar atento às transformações da Baixada Santista.
                      </p>
                    </>
                  )}
                  {/* Remover parágrafos genéricos de autor */}
                  {post.author !== "Héric Moura" && (
                    <>
                      {/* Aqui você pode manter outros autores, se desejar */}
                    </>
                  )}
                </div>
              </div>

              {/* Compartilhar removido */}

              {/* Card de Informações removido */}
            </div>
          </div>
        </article>
      </div>
    </>
  );
};

export default Noticia; 