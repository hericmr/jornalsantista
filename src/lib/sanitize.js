import DOMPurify from 'dompurify';

// Sanitiza HTML vindo do editor (CMS) antes de injetar via dangerouslySetInnerHTML.
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick']
  });
};

export default sanitizeHtml;
