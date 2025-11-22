import React from 'react';
import { Link } from 'react-router-dom';
import { createExcerpt, slugify, getFullImageUrl } from '../utils/textUtils';

const PostItem = ({ post }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const getExcerpt = (text, maxLength = 160) => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return 'Conteúdo não disponível...';
    }
    return createExcerpt(text, maxLength);
  };

  const getFeaturedImage = () => {
    try {
      console.log('🖼️ PostItem: Raw images from post:', {
        title: post.title,
        type: typeof post.images,
        value: post.images,
        raw: JSON.stringify(post.images)
      });
      
      const images = typeof post.images === 'string' ? JSON.parse(post.images) : post.images;
      const imageUrl = images && images.length > 0 ? images[0] : null;
      const finalUrl = imageUrl ? (getFullImageUrl(imageUrl) || imageUrl) : null;
      
      console.log('🖼️ PostItem: Final image URL:', finalUrl);
      return finalUrl;
    } catch (error) {
      console.error("🖼️ Error parsing images JSON in PostItem:", error);
      return null;
    }
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

  const getAuthorName = () => {
    if (post.authors && Array.isArray(post.authors) && post.authors.length > 0) {
      const validAuthors = post.authors.filter(author => 
        author && 
        typeof author === 'string' && 
        author.trim() !== ''
      );
      
      if (validAuthors.length === 1) {
        return validAuthors[0];
      } else if (validAuthors.length === 2) {
        return `${validAuthors[0]} e ${validAuthors[1]}`;
      } else if (validAuthors.length > 2) {
        return `${validAuthors.slice(0, -1).join(', ')} e ${validAuthors[validAuthors.length - 1]}`;
      }
    }
    return post.author || 'Autor não informado';
  };

  // Garantir que categories seja um array
  const getCategories = () => {
    if (!post.categories) return [];
    if (Array.isArray(post.categories)) return post.categories;
    if (typeof post.categories === 'string') {
      try {
        const parsed = JSON.parse(post.categories);
        return Array.isArray(parsed) ? parsed : [post.categories];
      } catch {
        return [post.categories];
      }
    }
    return [];
  };

  const categories = getCategories();

  const featuredImage = getFeaturedImage();

  return (
    <article className="article-item">
      <div className="article-item__content-wrapper">
        {/* Imagem */}
        {featuredImage && (
          <div className="article-item__image-container">
            <Link to={`/noticia/${post.slug || slugify(post.title || post.id || '')}`} className="article-item__image-link">
              <img 
                src={featuredImage} 
                className="article-item__image" 
                alt={getImageAlt()}
                onError={handleImageError}
                loading="lazy"
              />
            </Link>
          </div>
        )}

        <div className="article-item__text-content">
          {/* Categoria */}
          {categories.length > 0 && (
            <div className="article-item__categories">
              {categories.map((cat, idx) => (
                <span key={idx} className="article-item__category">
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Título */}
          <h2 className="article-item__title">
            <Link to={`/noticia/${post.slug || slugify(post.title || post.id || '')}`} className="article-item__title-link">
              {post.title || 'Título não disponível'}
            </Link>
          </h2>

          {/* Data */}
          {formatDate(post.published) && (
            <div className="article-item__date">
              {formatDate(post.published)}
            </div>
          )}

          {/* Autor */}
          <div className="article-item__author">
            Por <strong>{getAuthorName()}</strong>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostItem; 