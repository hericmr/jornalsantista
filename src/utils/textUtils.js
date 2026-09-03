// Utilitários para manipulação de texto HTML

/**
 * Remove tags HTML de um texto
 * @param {string} html - Texto com HTML
 * @returns {string} - Texto sem HTML
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Cria um resumo de texto removendo HTML
 * @param {string} html - Texto com HTML
 * @param {number} maxLength - Comprimento máximo do resumo
 * @returns {string} - Resumo sem HTML
 */
export const createExcerpt = (html, maxLength = 200) => {
  const plainText = stripHtml(html);
  
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + '...';
};

/**
 * Verifica se um texto contém uma palavra-chave (ignorando HTML)
 * @param {string} html - Texto com HTML
 * @param {string} searchTerm - Termo de busca
 * @returns {boolean} - True se contém o termo
 */
export const containsSearchTerm = (html, searchTerm) => {
  const plainText = stripHtml(html);
  return plainText.toLowerCase().includes(searchTerm.toLowerCase());
};

// Detecta se a string já vem como HTML estruturado (parágrafos, figuras, listas…).
const BLOCK_MARKUP_RE =
  /<(p|div|figure|section|article|ul|ol|li|h[1-6]|blockquote|table|pre)[\s/>]/i;

/**
 * Prepara o conteúdo para injeção no artigo.
 *
 * - Conteúdo estruturado (HTML do editor ou colado no banco com marcação
 *   semântica): as quebras de linha entre as tags são só indentação e não
 *   devem virar <br>. Removê-las evita parágrafos "furados" e <br> soltos
 *   dentro de <figure>/<ul>. O espaçamento fica por conta do CSS.
 * - Texto puro (sem tags de bloco): aí sim cada \n vira <br>.
 *
 * @param {string} html - Conteúdo bruto
 * @returns {string} - HTML pronto para sanitizar
 */
export const processHtmlContent = (html) => {
  if (!html || typeof html !== 'string') return '';
  if (BLOCK_MARKUP_RE.test(html)) {
    // remove só a indentação entre tags (espaços que contêm quebra de linha);
    // um espaço inline de verdade — ex.: "</a> <a>" — não tem \n e é preservado.
    return html.replace(/>[ \t]*\n[ \t\n]*</g, '><').trim();
  }
  return html.replace(/\n/g, '<br>');
};

/**
 * Gera URL completa para imagem
 * @param {string} imageUrl - URL da imagem
 * @returns {string} - URL completa da imagem
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Se já é uma URL completa (http/https), retorna como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Se é uma URL do Supabase Storage (começando com /)
  if (imageUrl.startsWith('/storage/')) {
    // Remove a barra inicial se existir para evitar URLs duplas
    return `${window.location.origin}${imageUrl}`;
  }
  
  // Se é uma URL relativa simples, adiciona o domínio base
  const baseUrl = window.location.origin;
  const cleanUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${baseUrl}${cleanUrl}`;
}; 

/**
 * Gera um slug URL-friendly a partir de um texto
 * @param {string} text - Texto de entrada
 * @returns {string} - Slug gerado
 */
export const slugify = (text) => {
  return text
    .toString()
    .normalize('NFD') // Remove acentos
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Espaços por hífen
    .replace(/-+/g, '-'); // Hífens múltiplos por um só
}; 