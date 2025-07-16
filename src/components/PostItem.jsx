import React from 'react';
import { Link } from 'react-router-dom';

const PostItem = ({ post }) => {
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

  const getExcerpt = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getFeaturedImage = () => {
    return post.images && post.images.length > 0 ? post.images[0] : null;
  };

  return (
    <div className="card mb-4 shadow-sm">
      <div className="row g-0">
        {getFeaturedImage() && (
          <div className="col-md-4">
            <img 
              src={getFeaturedImage()} 
              className="img-fluid rounded-start h-100 object-fit-cover" 
              alt={post.title}
              style={{ minHeight: '200px' }}
            />
          </div>
        )}
        <div className={getFeaturedImage() ? 'col-md-8' : 'col-md-12'}>
          <div className="card-body">
            <h5 className="card-title">
              <Link to={`/noticia/${post.id}`} className="text-decoration-none text-dark">
                {post.title}
              </Link>
            </h5>
            <p className="card-text text-muted">
              {getExcerpt(post.text_content)}
            </p>
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                <span>Por {post.author}</span>
                <br />
                <span>{formatDate(post.published)}</span>
              </div>
              <div className="text-end">
                {post.categories && post.categories.length > 0 ? (
                  <span className="badge bg-secondary me-1">
                    {post.categories[0]}
                  </span>
                ) : (
                  <span className="badge bg-light text-dark">Sem categoria</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem; 