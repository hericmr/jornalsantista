// Normalização de imagens de posts. Ponto único: a API do Supabase pode
// devolver `images` como array, string JSON, string única ou null.
import { getFullImageUrl } from '../utils/textUtils';

// Placeholder usado quando uma imagem falha ao carregar (SVG "Imagem não disponível").
export const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjhmOWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzU3ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbSBuw6NvIGRpc3BvbsOtdmVsPC90ZXh0Pjwvc3ZnPg==';

/**
 * Normaliza o campo `images` cru de um post numa lista de strings.
 * NÃO converte para URL absoluta — os valores voltam como estão salvos
 * (para não corromper o round-trip de edição no admin). Use `toImageSrc`
 * na hora de renderizar um <img>.
 * @param {*} raw
 * @returns {string[]}
 */
export const resolvePostImages = (raw) => {
  if (!raw) return [];

  let list = raw;

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed === '') return [];
    try {
      const parsed = JSON.parse(trimmed);
      list = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      list = [trimmed];
    }
  } else if (!Array.isArray(raw)) {
    list = [raw];
  }

  return list.filter(Boolean);
};

/** Resolve uma entrada de imagem para uma URL utilizável em `<img src>`. */
export const toImageSrc = (image) => {
  if (!image || typeof image !== 'string') return null;
  return getFullImageUrl(image) || image;
};

/** onError handler para <img>: troca a origem pelo placeholder. */
export const handleImageError = (e) => {
  if (e?.target) {
    e.target.src = IMAGE_PLACEHOLDER;
    e.target.style.objectFit = 'cover';
  }
};
