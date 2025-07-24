import React from 'react';

const MetaTags = ({
  title = 'Jornal Santista \u2013 M�dia alternativa na Baixada',
  description = 'M�dia independente com olhar cr�tico sobre a Baixada Santista. Informa��o com opini�o, den�ncias, cultura e debate sob a �tica dos trabalhadores.',
  image = '/js.webp',
  url = typeof window !== 'undefined' ? window.location.href : 'https://jornalsantista.com.br',
  type = 'website',
  author,
  publishedTime,
  modifiedTime
}) => {
  return (
    <>
      {/* Meta padr�o */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="jornal santista, m�dia alternativa, baixada santista, jornalismo independente, den�ncia, cr�tica social, cultura, pol�tica, trabalhadores" />
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
