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

/**
 * Processa conteúdo HTML preservando quebras de linha
 * @param {string} html - Conteúdo HTML
 * @returns {string} - HTML processado com quebras de linha preservadas
 */
export const processHtmlContent = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Preservar quebras de linha convertendo \n para <br>
  let processed = html.replace(/\n/g, '<br>');
  
  // Garantir que parágrafos tenham espaçamento adequado
  processed = processed.replace(/<p>/g, '<p style="margin-bottom: 1.5rem;">');
  
  return processed;
};

/**
 * Gera URL completa para imagem
 * @param {string} imageUrl - URL da imagem
 * @returns {string} - URL completa da imagem
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // Se já é uma URL completa, retorna como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Se é uma URL relativa, adiciona o domínio base
  const baseUrl = window.location.origin;
  return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}; 