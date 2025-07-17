import { useEffect } from 'react';

const MetaTags = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'article',
  author,
  publishedTime,
  modifiedTime 
}) => {
  useEffect(() => {
    // Atualizar título da página
    document.title = title || 'Jornal Santista';
    
    // Função para atualizar ou criar meta tags
    const updateMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Função para atualizar ou criar meta tags de propriedade (Open Graph)
    const updatePropertyTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Meta tags básicas
    updateMetaTag('description', description || 'Jornal Santista - Notícias locais e regionais');
    updateMetaTag('author', author || 'Jornal Santista');
    
    // Open Graph tags
    updatePropertyTag('og:title', title || 'Jornal Santista');
    updatePropertyTag('og:description', description || 'Jornal Santista - Notícias locais e regionais');
    updatePropertyTag('og:type', type);
    updatePropertyTag('og:url', url || window.location.href);
    
    if (image) {
      updatePropertyTag('og:image', image);
      updatePropertyTag('og:image:width', '1200');
      updatePropertyTag('og:image:height', '630');
    }
    
    if (author) {
      updatePropertyTag('og:author', author);
    }
    
    if (publishedTime) {
      updatePropertyTag('article:published_time', publishedTime);
    }
    
    if (modifiedTime) {
      updatePropertyTag('article:modified_time', modifiedTime);
    }
    
    // Twitter Card tags
    updatePropertyTag('twitter:card', 'summary_large_image');
    updatePropertyTag('twitter:title', title || 'Jornal Santista');
    updatePropertyTag('twitter:description', description || 'Jornal Santista - Notícias locais e regionais');
    
    if (image) {
      updatePropertyTag('twitter:image', image);
    }

    // Cleanup function
    return () => {
      document.title = 'Jornal Santista';
    };
  }, [title, description, image, url, type, author, publishedTime, modifiedTime]);

  return null; // Este componente não renderiza nada
};

export default MetaTags; 