import React from 'react';
import { Link } from 'react-router-dom';
import { createExcerpt, slugify } from '../utils/textUtils';
import { resolvePostImages, toImageSrc, handleImageError } from '../lib/images';

const PostItem = ({ post, variant = 'regular' }) => {
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
    } catch {
      return '';
    }
  };

  const getExcerpt = (text, maxLength = 160) => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return 'Conteúdo não disponível...';
    }
    return createExcerpt(text, maxLength);
  };

  const getFeaturedImage = () => toImageSrc(resolvePostImages(post.images)[0]);

  const getImageAlt = () => {
    let alt = '';
    if (post.title) alt += post.title;
    if (post.categories && post.categories.length > 0) alt += ` - ${post.categories[0]}`;
    return alt || 'Imagem da notícia';
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
  const title = post.title || 'Título não disponível';
  const author = getAuthorName();
  const date = formatDate(post.published);
  const linkTo = `/noticia/${post.slug || slugify(post.title || post.id || '')}`;

  const MetaLine = () => (
    <p className="meta-line">
      <strong>{author}</strong>
      {date && <><span className="dot">·</span>{date}</>}
    </p>
  );

  if (variant === 'hero') {
    return (
      <Link to={linkTo} className="hero-card">
        {featuredImage && (
          <span className="hero-media">
            <img src={featuredImage} alt={getImageAlt()} onError={handleImageError} loading="lazy" />
          </span>
        )}
        {categories[0] && <span className="kicker">{categories[0]}</span>}
        <h2 className="hero-title">{title}</h2>
        <MetaLine />
      </Link>
    );
  }

  if (variant === 'feature') {
    return (
      <article className="feed-feature">
        <Link to={linkTo}>
          {featuredImage && (
            <span className="feature-media">
              <img src={featuredImage} alt={getImageAlt()} onError={handleImageError} loading="lazy" />
            </span>
          )}
          <div className="feature-split">
            <div>
              {categories[0] && <span className="kicker">{categories[0]}</span>}
              <h2 className="feature-title">{title}</h2>
            </div>
            <div>
              <p className="feature-excerpt">{getExcerpt(post.text_content || post.content, 220)}</p>
              <MetaLine />
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="feed-item">
      <Link to={linkTo} className="feed-item-link">
        {featuredImage && (
          <span className="feed-media">
            <img src={featuredImage} alt={getImageAlt()} onError={handleImageError} loading="lazy" />
          </span>
        )}
        <div className="feed-body">
          {categories[0] && <span className="kicker">{categories[0]}</span>}
          <h3 className="feed-title">{title}</h3>
          <MetaLine />
          <p className="feed-excerpt">{getExcerpt(post.text_content || post.content, 160)}</p>
        </div>
      </Link>
    </article>
  );
};

export default PostItem;
