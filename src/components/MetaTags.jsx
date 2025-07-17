import React from 'react';

const MetaTags = ({
  title = 'Jornal Santista - Notícias Locais e Regionais',
  description = 'Jornal Santista - Sua fonte de notícias locais e regionais. Fique por dentro das principais notícias da região.',
  image = '/js.webp',
  url = window.location.href,
  type = 'website',
  author,
  publishedTime,
  modifiedTime
}) => {
  return (
    <>
      {/* Meta tags padrão */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="jornal, notícias, santista, região, local, jornalismo" />
      <meta name="author" content={author || 'Jornal Santista'} />
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Jornal Santista" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {author && <meta property="article:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {/* PWA e extras */}
      <meta name="theme-color" content="#000" />
      <meta name="apple-mobile-web-app-title" content="Jornal Santista" />
    </>
  );
};

export default MetaTags; 