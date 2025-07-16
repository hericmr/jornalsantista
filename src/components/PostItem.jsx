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

  const getExcerpt = (text, maxLength = 200) => {
    // Verificar se text existe e é uma string
    if (!text || typeof text !== 'string' || text.trim() === '') {
      console.log('⚠️ PostItem: text_content não disponível para post:', post.id, post.title);
      console.log('   Tentando usar content:', !!post.content, post.content?.length || 0);
      return 'Conteúdo não disponível...';
    }
    
    return createExcerpt(text, maxLength);
  };

  const getFeaturedImage = () => {
    return post.images && post.images.length > 0 ? post.images[0] : null;
  };

  const handleImageError = (e) => {
    // Se a imagem falhar ao carregar, substitui por um placeholder
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGRpc3BvbsOtdmVsPC90ZXh0Pjwvc3ZnPg==';
    e.target.style.objectFit = 'cover';
  };

  return (
    <div className="card h-100 shadow-sm border-0">
      {getFeaturedImage() && (
        <div className="position-relative">
          <img 
            src={getFeaturedImage()} 
            className="card-img-top" 
            alt={post.title || 'Imagem da notícia'}
            style={{ height: '200px', objectFit: 'cover' }}
            onError={handleImageError}
          />
          <div className="position-absolute top-0 start-0 m-2">
            {post.categories && post.categories.length > 0 ? (
              <span className="badge bg-primary">
                {post.categories[0]}
              </span>
            ) : (
              <span className="badge bg-secondary">Sem categoria</span>
            )}
          </div>
        </div>
      )}
      
      <div className="card-body d-flex flex-column">
        <div className="mb-2">
          <small className="text-muted">
            {formatDate(post.published)}
          </small>
        </div>
        
        <h5 className="card-title fw-bold mb-3">
          <Link to={`/noticia/${post.id}`} className="text-decoration-none text-dark">
            {post.title || 'Título não disponível'}
          </Link>
        </h5>
        
        <p className="card-text text-muted flex-grow-1">
          {getExcerpt(post.text_content || post.content)}
        </p>
        
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted small">
              {post.author || 'Autor não informado'}
            </div>
            <Link to={`/noticia/${post.id}`} className="btn btn-outline-dark btn-sm">
              Ler
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem; 