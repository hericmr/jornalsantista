import React from 'react';
import { Link } from 'react-router-dom';
import { createExcerpt } from '../utils/textUtils';

const PostItem = ({ post }) => {
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

  const getExcerpt = (text, maxLength = 160) => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return 'Conteúdo não disponível...';
    }
    return createExcerpt(text, maxLength);
  };

  const getFeaturedImage = () => {
    return post.images && post.images.length > 0 ? post.images[0] : null;
  };

  const getImageAlt = () => {
    let alt = '';
    if (post.title) alt += post.title;
    if (post.categories && post.categories.length > 0) alt += ` - ${post.categories[0]}`;
    return alt || 'Imagem da notícia';
  };

  const handleImageError = (e) => {
    // Se a imagem falhar ao carregar, substitui por um placeholder
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGRpc3BvbsOtdmVsPC90ZXh0Pjwvc3ZnPg==';
    e.target.style.objectFit = 'cover';
  };

  return (
    <article className="news-card">
      {/* Imagem no topo */}
      <div className="news-card__image-container">
        {getFeaturedImage() ? (
          <Link to={`/noticia/${post.slug || post.id}`} className="news-card__image-link">
            <img 
              src={getFeaturedImage()} 
              className="news-card__image" 
              alt={getImageAlt()}
              onError={handleImageError}
              loading="lazy"
            />
          </Link>
        ) : (
          <div className="news-card__image-placeholder">
            <svg width="10" height="10" viewBox="0 0 0 0" fill="none" xmlns="http://www.w3.org/2000/svg">             <rect width="400" height="240" fill="#f8f9fa"/>
              <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="#6757d" fontSize="16">                Imagem não disponível
              </text>
            </svg>
          </div>
        )}
        
        {/* Categoria sobreposta */}
        {post.categories && post.categories.length > 0 && (
          <div className="news-card__category">
            <span className="news-card__category-badge">
              {post.categories[0]}
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo do card */}
      <div className="news-card__content">
        {/* Título grande */}
        <h3 className="news-card__title">
          <Link to={`/noticia/${post.slug || post.id}`} className="news-card__title-link">
            {post.title || 'Título não disponível'}
          </Link>
        </h3>

        {/* Resumo */}
        <p className="news-card__excerpt">
          {getExcerpt(post.text_content || post.content)}
        </p>

        {/* Autor e Data */}
        <div className="news-card__meta">   <span className="news-card__author">
            {post.author || 'Autor não informado'}
          </span>
          <span className="news-card__date">
            {formatDate(post.published)}
          </span>
        </div>
      </div>
    </article>
  );
};

export default PostItem; 