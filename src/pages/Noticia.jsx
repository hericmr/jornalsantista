import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPublicPostBySlug } from '../lib/postsService';
import { processHtmlContent, createExcerpt, stripHtml } from '../utils/textUtils';
import { resolvePostImages, toImageSrc, handleImageError } from '../lib/images';
import { extractYouTubeId, getYouTubeThumbnail, getYouTubeEmbedUrl } from '../lib/video';
import { sanitizeHtml } from '../lib/sanitize';
import MetaTags from '../components/MetaTags';
import JsonLd from '../components/JsonLd';
import NewsletterModal from '../components/NewsletterModal';
import { newsArticleSchema, breadcrumbSchema } from '../lib/structuredData';
import { SITE } from '../config/site';

// Bios fixas de colaboradores recorrentes (até virem da tabela `authors`).
const AUTHOR_BIOS = {
  'Héric Moura':
    'Integrante da equipe do Jornal Santista desde 2015. Atua na cobertura de meio ambiente, movimentos sociais, cultura e política local, com atenção às pautas que afetam a vida da população trabalhadora da região.',
  'Walter Parreira':
    'Jornalista do Jornal Santista. Especialista em temas sociais, cultura e história regional, com olhar atento às transformações da Baixada Santista.',
  'Marcos de Paula':
    'Professor de Filosofia na Universidade Federal de São Paulo (Departamento de Saúde, Educação e Sociedade) e militante antiproibicionista.',
  'Carla Clemente':
    'Graduada e especializada em Filosofia e militante feminista.'
};
const DARLENE_BIO =
  'Autora brasileira nascida em São Paulo, formada em Direito e apaixonada pelas artes e letras. Escreve poesias e contos desde jovem e mantém o espaço "Devaneios e Poesias" no Jornal Santista desde 2015.';

const getAuthorImage = (author) => {
  if (author === 'Héric Moura') return 'https://hericmr.github.io/me/imagens/heric.png';
  if (author === 'Walter Parreira')
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjq8IpFqpYweRnLpCzLH8szo7Qw6VkhIFSWX92iTLn8S9dWe-gODvCpBa2aby9B-2Wo2KjUxTthS9BRsy9ZDbFRyYk3PxxHrFy50NqMKqfw2qbhUGW6IvhHsPeD3zHu1nzg329NOSk9n4OX5Wa2N8HC4OFmM5q0r3-hWT5-ple6N7NE7CGTklyRzYu-/w200-h200/servletrecuperafoto.gif';
  if (author === 'Marcos de Paula')
    return 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjDaaiv_fPSoxaDv3_KFFpE5JAYAbLj1tiu-dtN8HbqxkZNH0y4B2Qc5vpZheWXpRcegMMIfbYddakmju4h7YhAwzFIj527M4-hajHBwPIp0QMvLWbq2VPOYs5oWoTEr7wNpC3HnR3EX887gW0z3go0d-40juBLlm7yWKaZRuESrWDB8IG4Fu75pA49cLU/w200-h200/Marcos-De-Paula-3.jpg';
  if (author === 'Carla Clemente') return '/carla-clemente.jpg';
  if (author && author.toLowerCase().includes('darlene regina')) return '/darlene.jpeg';
  return null;
};

const getAuthorBio = (author) => {
  if (author && author.toLowerCase().includes('darlene regina')) return DARLENE_BIO;
  return AUTHOR_BIOS[author] || 'Colaborador(a) convidado(a) do Jornal Santista.';
};

const joinAuthors = (authors) => {
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} e ${authors[1]}`;
  return `${authors.slice(0, -1).join(', ')} e ${authors[authors.length - 1]}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  const month = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} de ${month} de ${d.getFullYear()}, ${hh}h${mm}`;
};

const toISO = (dateString) => {
  if (!dateString) return undefined;
  const d = new Date(dateString);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};

const Noticia = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublicPostBySlug(slug)
      .then((found) => {
        if (active) setPost(found);
      })
      .catch((err) => console.error('Erro ao carregar post:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    // Controle de leitura de matérias (dispara a newsletter na 2ª leitura)
    try {
      const key = 'noticias_lidas';
      const count = parseInt(localStorage.getItem(key) || '0', 10) + 1;
      localStorage.setItem(key, String(count));
      if (count === 2) setShowNewsletter(true);
    } catch {
      /* localStorage indisponível */
    }

    return () => {
      active = false;
    };
  }, [slug]);

  // Barra de progresso de leitura
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (el.scrollTop / total) * 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [post]);

  const authors = useMemo(() => {
    if (!post) return [];
    const list = Array.isArray(post.authors) ? post.authors : [];
    const valid = list.filter((a) => a && typeof a === 'string' && a.trim() !== '');
    if (valid.length > 0) return valid;
    if (post.author && post.author.trim() !== '' && post.author !== 'Autor não informado') {
      return [post.author];
    }
    return [];
  }, [post]);

  const readingMinutes = useMemo(() => {
    if (!post) return 1;
    const words = stripHtml(post.text_content || post.content || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [post]);

  const shareOnSocialMedia = (platform) => {
    const url = window.location.href;
    const title = post?.title || 'Jornal Santista';
    let shareUrl = '';
    if (platform === 'whatsapp') shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (platform === 'x') shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    if (shareUrl) window.open(shareUrl, '_blank', 'noopener,width=600,height=500');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
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
      <div className="container mt-5 text-center">
        <h3>Notícia não encontrada</h3>
        <Link to="/" className="btn btn-dark">Voltar para a Home</Link>
      </div>
    );
  }

  const images = resolvePostImages(post.images);
  const videoId = extractYouTubeId(post.video_url);
  const heroImage = images.length > 0 ? toImageSrc(images[0]) : getYouTubeThumbnail(videoId);
  const pageUrl = window.location.href;
  const metaDescription = post.excerpt || createExcerpt(post.text_content || post.content || '', 160);
  const section = Array.isArray(post.categories) && post.categories.length > 0 ? post.categories[0] : undefined;
  const publishedTime = post.published || post.published_at;
  const modifiedTime = post.updated_at || post.updated;
  const authorsLabel = authors.length > 0 ? joinAuthors(authors) : 'Redação';

  const renderShare = (variant) => (
    <div className={variant === 'rail' ? 'article-share-rail' : 'article-share-inline'}>
      <button type="button" className="share-btn" onClick={() => shareOnSocialMedia('whatsapp')} aria-label="Compartilhar no WhatsApp">
        <i className="bi bi-whatsapp" aria-hidden="true"></i>
      </button>
      <button type="button" className="share-btn" onClick={() => shareOnSocialMedia('facebook')} aria-label="Compartilhar no Facebook">
        <i className="bi bi-facebook" aria-hidden="true"></i>
      </button>
      <button type="button" className="share-btn" onClick={() => shareOnSocialMedia('x')} aria-label="Compartilhar no X">
        <i className="bi bi-twitter-x" aria-hidden="true"></i>
      </button>
      <button type="button" className="share-btn" onClick={copyLink} aria-label={copied ? 'Link copiado' : 'Copiar link'}>
        <i className={`bi ${copied ? 'bi-check2' : 'bi-link-45deg'}`} aria-hidden="true"></i>
      </button>
    </div>
  );

  const displayAuthors = authors.length > 0 ? authors : ['Redação'];

  const renderAvatars = () => (
    <div className="article-byline-avatars">
      {displayAuthors.slice(0, 3).map((author, i) => {
        const img = getAuthorImage(author);
        return img ? (
          <img key={i} src={img} alt={author} loading="lazy" onError={handleImageError} />
        ) : (
          <span key={i} className="ph" aria-hidden="true">
            <i className="bi bi-person-fill"></i>
          </span>
        );
      })}
    </div>
  );

  return (
    <>
      {showNewsletter && <NewsletterModal onClose={() => setShowNewsletter(false)} />}

      <MetaTags
        title={post.title || `Notícia — ${SITE.name}`}
        description={metaDescription}
        image={heroImage}
        url={pageUrl}
        type="article"
        author={authors[0]}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
      />
      <JsonLd
        data={[
          newsArticleSchema({
            title: post.title,
            description: metaDescription,
            url: pageUrl,
            image: heroImage,
            authors,
            publishedTime,
            modifiedTime,
            section
          }),
          breadcrumbSchema([
            { name: 'Início', url: SITE.url },
            ...(section ? [{ name: section, url: `${SITE.url}/categorias/${encodeURIComponent(section)}` }] : []),
            { name: post.title || 'Notícia' }
          ])
        ]}
      />

      <div className="reading-progress" style={{ width: `${progress}%` }} aria-hidden="true" />

      {videoId ? (
        <div className="article-video">
          <iframe
            src={getYouTubeEmbedUrl(videoId)}
            title={post.title || 'Vídeo'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : (
        heroImage && (
          <div className="article-hero">
            <img
              className="article-hero-img"
              src={heroImage}
              alt={post.title || 'Notícia'}
              width="1600"
              height="900"
              fetchPriority="high"
              decoding="async"
              onError={handleImageError}
            />
            <div className="article-hero-overlay">
              <div className="article-hero-inner">
                {section && <span className="kicker">{section}</span>}
                <h1 className="article-hero-title">{post.title || 'Título não disponível'}</h1>
              </div>
            </div>
          </div>
        )
      )}

      <div className="article-layout">
        {renderShare('rail')}

        <article className="article-body">
          <nav className="article-breadcrumb" aria-label="Trilha de navegação">
            <Link to="/">Início</Link>
            {section && (
              <>
                <span aria-hidden="true">/</span>
                <Link to={`/categorias/${encodeURIComponent(section)}`}>{section}</Link>
              </>
            )}
          </nav>

          {(!heroImage || videoId) && (
            <header className="article-head-plain">
              {section && <span className="kicker">{section}</span>}
              <h1 className="article-title">{post.title || 'Título não disponível'}</h1>
            </header>
          )}

          <div className="article-byline">
            {renderAvatars()}
            <div>
              <div className="article-byline-name">Por {authorsLabel}</div>
              <div className="article-byline-meta">
                {publishedTime && <time dateTime={toISO(publishedTime)}>{formatDateTime(publishedTime)}</time>}
                <span className="dot">·</span>
                {readingMinutes} min de leitura
                {modifiedTime && modifiedTime !== publishedTime && (
                  <>
                    <span className="dot">·</span>
                    atualizado em {formatDateTime(modifiedTime)}
                  </>
                )}
              </div>
            </div>
          </div>

          {renderShare('inline')}

          <div className="article-content">
            {post.text_content || post.content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(processHtmlContent(post.text_content || post.content))
                }}
              />
            ) : (
              <p className="text-muted">Conteúdo não disponível.</p>
            )}
          </div>

          {images.length > 1 && (
            <div className="article-gallery">
              {images.slice(1).map((image, idx) => (
                <figure key={idx + 1}>
                  <img
                    src={toImageSrc(image)}
                    alt={`${post.title || 'Notícia'} — imagem ${idx + 2}`}
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                  />
                </figure>
              ))}
            </div>
          )}

          {section && Array.isArray(post.categories) && post.categories.length > 0 && (
            <div className="article-tags">
              {post.categories.map((category) => (
                <Link key={category} to={`/categorias/${encodeURIComponent(category)}`}>
                  {category}
                </Link>
              ))}
            </div>
          )}

          <section className="article-authors">
            <h2>Quem escreveu</h2>
            {displayAuthors.map((author) => {
              const img = getAuthorImage(author);
              return (
                <div className="author-bio" key={author}>
                  {img ? (
                    <img src={img} alt={author} loading="lazy" onError={handleImageError} />
                  ) : (
                    <span className="ph" aria-hidden="true">
                      <i className="bi bi-person-fill"></i>
                    </span>
                  )}
                  <div>
                    <p className="author-bio-name">{author}</p>
                    <p className="author-bio-text">
                      {author === 'Redação'
                        ? 'Equipe do Jornal Santista.'
                        : getAuthorBio(author)}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>
        </article>
      </div>
    </>
  );
};

export default Noticia;
