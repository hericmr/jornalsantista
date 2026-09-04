import DOMPurify from 'dompurify';

// Sanitiza HTML do editor (CMS) antes de gravar (savePost) e antes de injetar
// via dangerouslySetInnerHTML na leitura pública. As duas pontas usam esta
// mesma função — o que é salvo é exatamente o que o público renderiza.

// Marcações permitidas além do perfil `html` do DOMPurify (que já cobre p,
// h1–h6, ul/ol/li, blockquote, figure, figcaption, hr, cite, aside, a, img,
// strong/em/s/u/b/i, br, etc.). Aqui só reforçamos atributos e classes.

// Classes aceitas no corpo: os elementos jornalísticos (PLANO_PAINEL.md, D1) e
// nada mais. Qualquer outra classe (lixo de Word/Google Docs, utilitários de
// CSS colados, etc.) é removida, mesmo quando a tag é mantida.
const ALLOWED_CLASSES = new Set([
  'olho', // <blockquote class="olho"> — citação destacada
  'boxe', // <aside class="boxe">
  'nota-editor', // <aside class="nota-editor">
  'credito' // <figcaption class="credito"> — crédito de foto
]);

// Hook global do DOMPurify: filtra o valor de `class` contra a allowlist.
// Instalado uma única vez (o módulo carrega uma vez por sessão).
let hookInstalled = false;
const installClassHook = () => {
  if (hookInstalled) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (!node.getAttribute || !node.hasAttribute('class')) return;
    const kept = node
      .getAttribute('class')
      .split(/\s+/)
      .filter((c) => ALLOWED_CLASSES.has(c));
    if (kept.length) node.setAttribute('class', kept.join(' '));
    else node.removeAttribute('class');
  });
  hookInstalled = true;
};

export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  installClassHook();
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    // Links abrem em nova aba com rel seguro (o editor grava assim).
    ADD_ATTR: ['target', 'rel'],
    // `style` inline, scripts, iframes e formulários nunca entram no corpo.
    FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'srcset']
  });
};

export default sanitizeHtml;
