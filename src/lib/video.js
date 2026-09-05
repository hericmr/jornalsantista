// Suporte a vídeos do YouTube como posts. Só o vídeo é resolvido aqui —
// o resto do fluxo (feed, admin, matéria) trata o post normalmente.
//
// Segurança: só extraímos um ID de youtube.com/youtu.be. Qualquer outra URL
// vira null e o post cai de volta no comportamento sem vídeo — nunca
// injetamos a URL crua num iframe.

const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/** Extrai o ID de 11 caracteres de uma URL do YouTube. null se não reconhecer. */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\.|^m\./, '');
  let id = null;

  if (host === 'youtu.be') {
    id = parsed.pathname.slice(1).split('/')[0];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (parsed.pathname === '/watch') {
      id = parsed.searchParams.get('v');
    } else if (parsed.pathname.startsWith('/embed/')) {
      id = parsed.pathname.split('/embed/')[1];
    } else if (parsed.pathname.startsWith('/shorts/')) {
      id = parsed.pathname.split('/shorts/')[1];
    }
  } else {
    return null;
  }

  id = (id || '').split(/[?&/]/)[0];
  return YOUTUBE_ID_RE.test(id) ? id : null;
};

/** URL da miniatura pública do vídeo (usada como imagem de capa do post). */
export const getYouTubeThumbnail = (id) =>
  id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;

/** URL de embed (domínio -nocookie, sem cookies de rastreamento do YouTube). */
export const getYouTubeEmbedUrl = (id) =>
  id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
