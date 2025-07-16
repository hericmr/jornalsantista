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