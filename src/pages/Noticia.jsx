import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlugOrId } from '../lib/postsService';
import { processHtmlContent, createExcerpt } from '../utils/textUtils';
import { resolvePostImages, toImageSrc, handleImageError } from '../lib/images';
import { sanitizeHtml } from '../lib/sanitize';
import MetaTags from '../components/MetaTags';
import JsonLd from '../components/JsonLd';
import NewsletterModal from '../components/NewsletterModal';
import { newsArticleSchema, breadcrumbSchema } from '../lib/structuredData';
import { SITE } from '../config/site';

const Noticia = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    fetchPost();
    // Controle de leitura de matérias
    const key = 'noticias_lidas';
    let count = parseInt(localStorage.getItem(key) || '0', 10);
    count += 1;
    localStorage.setItem(key, count);
    if (count === 2) setShowNewsletter(true);
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const foundPost = await getPostBySlugOrId(slug);
      setPost(foundPost);
    } catch (error) {
      console.error('Erro ao carregar post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      return date.toLocaleDateString('pt-BR', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data não disponível';
    }
  };

  // Função para obter lista de autores (compatibilidade com formato antigo e novo)
  const getAuthors = () => {
    if (post.authors && Array.isArray(post.authors) && post.authors.length > 0) {
      // Filtrar valores vazios, null, undefined
      const validAuthors = post.authors.filter(author => 
        author && 
        typeof author === 'string' && 
        author.trim() !== ''
      );
      if (validAuthors.length > 0) {
        return validAuthors;
      }
    }
    if (post.author && typeof post.author === 'string' && post.author.trim() !== '') {
      return [post.author];
    }
    return ['Autor não informado'];
  };

  // Função para verificar se um autor é um dos autores especiais
  const isSpecialAuthor = (author) => {
    const specialAuthors = ["Héric Moura", "Walter Parreira", "Marcos de Paula"];
    return specialAuthors.includes(author) || 
           (author && author.toLowerCase().includes("darlene regina"));
  };

  // Função para obter a imagem do autor
  const getAuthorImage = (author) => {
    if (author === "Héric Moura") {
      return "https://hericmr.github.io/me/imagens/heric.png";
    }
    if (author === "Walter Parreira") {
      return "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjq8IpFqpYweRnLpCzLH8szo7Qw6VkhIFSWX92iTLn8S9dWe-gODvCpBa2aby9B-2Wo2KjUxTthS9BRsy9ZDbFRyYk3PxxHrFy50NqMKqfw2qbhUGW6IvhHsPeD3zHu1nzg329NOSk9n4OX5Wa2N8HC4OFmM5q0r3-hWT5-ple6N7NE7CGTklyRzYu-/w200-h200/servletrecuperafoto.gif";
    }
    if (author === "Marcos de Paula") {
      return "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjDaaiv_fPSoxaDv3_KFFpE5JAYAbLj1tiu-dtN8HbqxkZNH0y4B2Qc5vpZheWXpRcegMMIfbYddakmju4h7YhAwzFIj527M4-hajHBwPIp0QMvLWbq2VPOYs5oWoTEr7wNpC3HnR3EX887gW0z3go0d-40juBLlm7yWKaZRuESrWDB8IG4Fu75pA49cLU/w200-h200/Marcos-De-Paula-3.jpg";
    }
    if (author === "Carla Clemente") {
      return "/DSC00192-EDIT(1).jpg";
    }
    if (author && author.toLowerCase().includes("darlene regina")) {
      return "/darlene.jpeg";
    }
    return null;
  };

  const shareOnSocialMedia = (platform) => {
    const url = window.location.href;
    const title = post?.title || 'Jornal Santista';
    // const text = stripHtml(post?.text_content || post?.content || '').substring(0, 100);

    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        // Inclui título e link no texto
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        break;
      case 'instagram':
        // Instagram não permite compartilhamento direto de links via web, então pode abrir o perfil do Jornal ou mostrar um aviso
        window.open('https://instagram.com/jornalsantista', '_blank');
        return;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
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
      <div className="container mt-5">
        <div className="text-center">
          <h3>Notícia não encontrada</h3>
          <Link to="/" className="btn btn-dark">
            Voltar para Home
          </Link>
        </div>
      </div>
    );
  }

  const images = resolvePostImages(post.images);
  const pageUrl = window.location.href;
  const metaDescription = post?.excerpt || createExcerpt(post?.text_content || post?.content || '', 160);
  const metaImage = images.length > 0 ? toImageSrc(images[0]) : null;
  const realAuthors = getAuthors().filter((name) => name && name !== 'Autor não informado');
  const section = Array.isArray(post?.categories) && post.categories.length > 0 ? post.categories[0] : undefined;
  const publishedTime = post?.published || post?.published_at;
  const modifiedTime = post?.updated_at || post?.updated;

  return (
    <>
      {showNewsletter && <NewsletterModal onClose={() => setShowNewsletter(false)} />}
      {/* Meta Tags para SEO e compartilhamento */}
      <MetaTags
        title={post?.title || `Notícia — ${SITE.name}`}
        description={metaDescription}
        image={metaImage}
        url={pageUrl}
        type="article"
        author={realAuthors[0]}
        publishedTime={publishedTime}
        modifiedTime={modifiedTime}
      />
      <JsonLd
        data={[
          newsArticleSchema({
            title: post?.title,
            description: metaDescription,
            url: pageUrl,
            image: metaImage,
            authors: realAuthors,
            publishedTime,
            modifiedTime,
            section
          }),
          breadcrumbSchema([
            { name: 'Início', url: SITE.url },
            ...(section ? [{ name: section, url: `${SITE.url}/categorias/${encodeURIComponent(section)}` }] : []),
            { name: post?.title || 'Notícia' }
          ])
        ]}
      />

      <div className="container mt-4">
        <article>
          {/* Conteúdo Principal */}
          <div>
            <div className="row justify-content-center">
              <div className="col-lg-8">
            {/* Header da Notícia */}
            <header className="mb-4">
              {/* Título */}
              <h1 className="display-4 fw-bold mb-3" style={{ lineHeight: '1.2' }}>
                {post.title || 'Título não disponível'}
              </h1>

              {/* Meta informações */}
              <div className="d-flex flex-wrap justify-content-between align-items-center text-muted mb-4">
                <div className="d-flex align-items-center">
                  {/* Exibir imagens dos autores */}
                  <div className="d-flex me-2">
                    {getAuthors().slice(0, 3).map((author, index) => {
                      const authorImage = getAuthorImage(author);
                      return authorImage ? (
                        <img 
                          key={index}
                          src={authorImage} 
                          alt={author} 
                          className="rounded-circle"
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            filter: 'grayscale(100%)',
                            marginLeft: index > 0 ? '-15px' : '0',
                            border: '2px solid white',
                            zIndex: 3 - index
                          }} 
                        />
                      ) : (
                        <div
                          key={index}
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '60px',
                            height: '60px',
                            backgroundColor: '#6c757d',
                            marginLeft: index > 0 ? '-15px' : '0',
                            border: '2px solid white',
                            zIndex: 3 - index
                          }}
                        >
                          <i className="bi bi-person-fill" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                        </div>
                      );
                    })}
                    {getAuthors().length > 3 && (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: '#495057',
                          marginLeft: '-15px',
                          border: '2px solid white',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          color: 'white'
                        }}
                      >
                        +{getAuthors().length - 3}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="fw-semibold mb-1">
                      Por {(() => {
                        const authors = getAuthors();
                        if (authors.length === 1) {
                          return authors[0];
                        } else if (authors.length === 2) {
                          return `${authors[0]} e ${authors[1]}`;
                        } else if (authors.length > 2) {
                          return `${authors.slice(0, -1).join(', ')} e ${authors[authors.length - 1]}`;
                        }
                        return 'Autor não informado';
                      })()}
                    </div>
                    <div className="small">
                      {formatDate(post.published)}
                    </div>
                    {post.updated && post.updated !== post.published && (
                      <div className="small">
                        Atualizado em {formatDate(post.updated)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Botões de compartilhamento minimalistas */}
                <div className="d-flex flex-wrap gap-2 justify-content-end justify-content-md-start">
                  <button 
                    onClick={() => shareOnSocialMedia('whatsapp')}
                    className="d-flex align-items-center justify-content-center"
                    title="Compartilhar no WhatsApp"
                    style={{ width: 36, height: 36, borderRadius: '50%', padding: 0, background: '#25D366', border: 'none' }}
                  >
                    <i className="bi bi-whatsapp" style={{ fontSize: '1rem', color: '#fff' }}></i>
                  </button>
                  <button 
                    onClick={() => shareOnSocialMedia('facebook')}
                    className="d-flex align-items-center justify-content-center"
                    title="Compartilhar no Facebook"
                    style={{ width: 36, height: 36, borderRadius: '50%', padding: 0, background: '#1877F3', border: 'none' }}
                  >
                    <i className="bi bi-facebook" style={{ fontSize: '1rem', color: '#fff' }}></i>
                  </button>
                  <button 
                    onClick={() => shareOnSocialMedia('twitter')}
                    className="d-flex align-items-center justify-content-center"
                    title="Compartilhar no Twitter"
                    style={{ width: 36, height: 36, borderRadius: '50%', padding: 0, background: '#1DA1F2', border: 'none' }}
                  >
                    <i className="bi bi-twitter" style={{ fontSize: '1rem', color: '#fff' }}></i>
                  </button>
                  <button 
                    onClick={() => shareOnSocialMedia('instagram')}
                    className="d-flex align-items-center justify-content-center"
                    title="Compartilhar no Instagram"
                    style={{ width: 36, height: 36, borderRadius: '50%', padding: 0, background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)', border: 'none' }}
                  >
                    <i className="bi bi-instagram" style={{ fontSize: '1rem', color: '#fff' }}></i>
                  </button>
                </div>
              </div>
            </header>

            {/* Imagem principal do bucket (galeria/thumbnail) */}
            {images.length > 0 && (
              <div className="mb-4 img-full-mobile">
                <figure className="mb-3 text-center">
                  <img
                    src={toImageSrc(images[0])}
                    className="img-fluid rounded shadow-lg"
                    alt={`${post.title || 'Notícia'} - Imagem 1`}
                    title={post.title || 'Notícia'}
                    width="1200"
                    height="675"
                    style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }}
                    onError={handleImageError}
                    fetchPriority="high"
                    decoding="async"
                  />
                </figure>
              </div>
            )}

            {/* Texto da matéria */}
            <div className="article-content mb-5">
              {(post.text_content || post.content) ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(processHtmlContent(post.text_content || post.content))
                  }}
                />
              ) : (
                <p className="text-muted">Conteúdo não disponível.</p>
              )}
            </div>

            {/* Imagens extras após o texto */}
            {images.length > 1 && (
              <div className="mb-4">
                {images.slice(1).map((image, idx) => (
                  <figure key={idx + 1} className="mb-3 text-center">
                    <img
                      src={toImageSrc(image)}
                      className="img-fluid rounded shadow-lg"
                      alt={`${post.title || 'Notícia'} - Imagem ${idx + 2}`}
                      title={post.title || 'Notícia'}
                      width="1200"
                      height="675"
                      style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover' }}
                      onError={handleImageError}
                      loading="lazy"
                      decoding="async"
                    />
                  </figure>
                ))}
              </div>
            )}

            {/* Tags e Categorias */}
            <div className="mb-4">
              <div>
                {post.categories && Array.isArray(post.categories) && post.categories.length > 0 ? (
                  post.categories.map((category, index) => (
                    <Link 
                      key={index} 
                      to={`/categorias/${category}`} 
                      className="badge bg-light text-dark me-1 mb-1 text-decoration-none"
                    >
                      #{category}
                    </Link>
                  ))
                ) : (
                  <span className="text-muted">Nenhuma tag disponível</span>
                )}
              </div>
            </div>

            {/* Navegação */}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-4">
            <div style={{ top: '2rem' }}>
              {/* Informações do Autor */}
              <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                  <div className="card mb-4 bg-dark text-light border-secondary">
                    <div className="card-body">
                      {getAuthors().map((author, index) => {
                        const authorImage = getAuthorImage(author);
                        
                        if (author === "Carla Clemente") {
                          return (
                            <div key={index} className={`author-info ${index > 0 ? 'mt-4 pt-3 border-top border-secondary' : ''}`}>
                              <div className="text-center mb-3">
                                <img
                                  src="/DSC00192-EDIT(1).jpg"
                                  alt="Carla Clemente"
                                  style={{ width: '120px', borderRadius: '50%', filter: 'grayscale(1)', background: '#222' }}
                                  className="mb-2 shadow"
                                />
                              </div>
                              <p className="card-text mb-1">
                                <strong>Carla Clemente</strong>
                              </p>
                              <p className="card-text small mb-0">
                                Carla Clemente é graduada e especializada em Filosofia e militante feminista.
                              </p>
                            </div>
                          );
                        }
                        if (author === "Héric Moura") {
                          return (
                            <div key={index} className={`author-info ${index > 0 ? 'mt-4 pt-3 border-top border-secondary' : ''}`}>
                              <>
                                <div className="text-center mb-3">
                                  <img
                                    src="https://hericmr.github.io/me/imagens/heric.png"
                                    alt="Héric Moura"
                                    style={{ width: '120px', borderRadius: '50%', filter: 'grayscale(1)', background: '#222' }}
                                    className="mb-2 shadow"
                                  />
                                </div>
                                <p className="card-text mb-1">
                                  <strong>Héric Moura</strong>
                                </p>
                                <p className="card-text small mb-0">
                                  Integrante da equipe do Jornal Santista desde 2015. Atua na cobertura de temas ligados a meio ambiente, movimentos sociais, cultura e política local, com atenção especial às pautas que afetam diretamente a vida da população trabalhadora da região.
                                </p>
                              </>
                            </div>
                          );
                        }
                        if (author === "Walter Parreira") {
                          return (
                            <div key={index} className={`author-info ${index > 0 ? 'mt-4 pt-3 border-top border-secondary' : ''}`}>
                              <>
                                <div className="text-center mb-3">
                                  <img
                                    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjq8IpFqpYweRnLpCzLH8szo7Qw6VkhIFSWX92iTLn8S9dWe-gODvCpBa2aby9B-2Wo2KjUxTthS9BRsy9ZDbFRyYk3PxxHrFy50NqMKqfw2qbhUGW6IvhHsPeD3zHu1nzg329NOSk9n4OX5Wa2N8HC4OFmM5q0r3-hWT5-ple6N7NE7CGTklyRzYu-/w200-h200/servletrecuperafoto.gif"
                                    alt="Walter Parreira"
                                    style={{ width: '120px', borderRadius: '50%', filter: 'grayscale(1)', background: '#222' }}
                                    className="mb-2 shadow"
                                  />
                                </div>
                                <p className="card-text mb-1">
                                  <strong>Walter Parreira</strong>
                                </p>
                                <p className="card-text small mb-0">
                                  Jornalista do Jornal Santista. Especialista em temas sociais, cultura e história regional, com olhar atento às transformações da Baixada Santista.
                                </p>
                              </>
                            </div>
                          );
                        }
                        if (author === "Marcos de Paula") {
                          return (
                            <div key={index} className={`author-info ${index > 0 ? 'mt-4 pt-3 border-top border-secondary' : ''}`}>
                              <>
                                <div className="text-center mb-3">
                                  <img
                                    src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjDaaiv_fPSoxaDv3_KFFpE5JAYAbLj1tiu-dtN8HbqxkZNH0y4B2Qc5vpZheWXpRcegMMIfbYddakmju4h7YhAwzFIj527M4-hajHBwPIp0QMvLWbq2VPOYs5oWoTEr7wNpC3HnR3EX887gW0z3go0d-40juBLlm7yWKaZRuESrWDB8IG4Fu75pA49cLU/w200-h200/Marcos-De-Paula-3.jpg"
                                    alt="Marcos de Paula"
                                    style={{ width: '120px', borderRadius: '50%', filter: 'grayscale(1)', background: '#222' }}
                                    className="mb-2 shadow"
                                  />
                                </div>
                                <p className="card-text mb-1">
                                  <strong>Marcos de Paula</strong>
                                </p>
                                <p className="card-text small mb-0">
                                  Professor de Filosofia na Universidade Federal de São Paulo - Departamento de Saúde, Educação e Sociedade e militante antiproibicionista.
                                </p>
                              </>
                            </div>
                          );
                        }
                        if (author && author.toLowerCase().includes("darlene regina")) {
                          return (
                            <div key={index} className={`author-info ${index > 0 ? 'mt-4 pt-3 border-top border-secondary' : ''}`}>
                              <>
                                <div className="text-center mb-3">
                                  <img
                                    src="/darlene.jpeg"
                                    alt="Darlene Regina"
                                    style={{ width: '120px', borderRadius: '50%', filter: 'grayscale(1)', background: '#222' }}
                                    className="mb-2 shadow"
                                  />
                                </div>
                                <p className="card-text mb-1">
                                  <strong>Darlene Regina</strong>
                                </p>
                                <p className="card-text small mb-0">
                                  Autora brasileira, nascida em São Paulo, formada em Direito e apaixonada pelas artes e letras. Dedica-se desde jovem à escrita de poesias e contos, sendo autora dos livros "Bianca – Um amor que sobrevive aos séculos" (romance) e "Para um Doce Cavaleiro" (poesia), ambos pela Editora Clube de Autores, além de diversos contos publicados pelo Grupo Editorial Quimera. Colaboradora do Jornalsantista desde 2015, mantém o espaço "Devaneios e Poesias" para divulgação de seus textos, dicas literárias e promoção da cultura regional.
                                </p>
                              </>
                            </div>
                          );
                        }
                        // Autor genérico (apenas se não for Carla Clemente)
                        return (
                          <div key={index} className={`author-info ${index > 0 ? 'mt-4 pt-3 border-top border-secondary' : ''}`}>
                            <div className="text-center mb-3">
                              <i className="bi bi-person-circle" style={{ fontSize: '3rem', color: '#888' }}></i>
                            </div>
                            <p className="card-text mb-1">
                              <strong>{author}</strong>
                            </p>
                            <p className="card-text small mb-0">
                              Autor(a) convidado(a) do Jornal Santista.
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Compartilhar removido */}

              {/* Card de Informações removido */}
            </div>
          </div>
        </article>
      </div>
      {/* Breadcrumb Mobile (final da página) */}
      <nav aria-label="breadcrumb" className="mb-4 d-block d-md-none">
        <ol className="breadcrumb small breadcrumb-mobile-small">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none">Home</Link>
          </li>
          {post.categories && post.categories.length > 0 && (
            <li className="breadcrumb-item">
              <Link to={`/categorias/${post.categories[0]}`} className="text-decoration-none">
                {post.categories[0]}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            {post.title || 'Notícia'}
          </li>
        </ol>
      </nav>
    </>
  );
};

export default Noticia; 