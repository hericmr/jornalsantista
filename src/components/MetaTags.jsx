import React from 'react';

const SITE_NAME = 'Jornal Santista';
const DEFAULT_TITLE = 'Jornal Santista – Mídia alternativa na Baixada';
const DEFAULT_DESCRIPTION =
  'Mídia independente com olhar crítico sobre a Baixada Santista. Informação com opinião, denúncias, cultura e debate sob a ótica dos trabalhadores.';
const SITE_ORIGIN = 'https://www.jornalsantista.com.br';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/og-default.png`;
const DEFAULT_KEYWORDS =
  'jornal santista, mídia alternativa, baixada santista, jornalismo independente, denúncia, crítica social, cultura, política, trabalhadores';

// og:image precisa ser URL absoluta para os crawlers.
const absolute = (src) => {
  if (!src) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(src)) return src;
  return `${SITE_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
};

const MetaTags = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image,
  url = typeof window !== 'undefined' ? window.location.href : SITE_ORIGIN,
  type = 'website',
  author,
  publishedTime,
  modifiedTime
}) => {
  const ogImage = absolute(image);
  return (
    <>
      {/* Meta padrão */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={DEFAULT_KEYWORDS} />
      <meta name="author" content={author || SITE_NAME} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="pt_BR" />
      {author && <meta property="article:author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* PWA e extras */}
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
    </>
  );
};

export default MetaTags;
