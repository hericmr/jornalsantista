// Compressão de imagens no navegador antes do upload. Fotos de celular chegam
// com 3–8 MB; redimensionadas para no máximo 1920px e salvas em WebP ficam
// em geral abaixo de 400 KB, sem perda visível no tamanho em que o site exibe.
//
// GIF (pode ser animado) e SVG passam direto. Se a conversão falhar ou não
// reduzir o arquivo, o original é usado.

const MAX_SIDE = 1920;
const QUALITY = 0.82;
const SKIP_TYPES = ['image/gif', 'image/svg+xml'];

const loadBitmap = async (file) => {
  if ('createImageBitmap' in window) {
    // imageOrientation respeita a rotação EXIF das fotos de celular.
    return createImageBitmap(file, { imageOrientation: 'from-image' });
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const toBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * @param {File} file
 * @returns {Promise<File>} arquivo comprimido (ou o original)
 */
export const compressImage = async (file) => {
  if (!file?.type?.startsWith('image/') || SKIP_TYPES.includes(file.type)) {
    return file;
  }

  try {
    const bitmap = await loadBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await toBlob(canvas, 'image/webp', QUALITY);
    // Safari antigo não gera WebP e devolve PNG: nesse caso tenta JPEG.
    const finalBlob =
      blob && blob.type === 'image/webp'
        ? blob
        : await toBlob(canvas, 'image/jpeg', QUALITY);

    if (!finalBlob || finalBlob.size >= file.size) return file;

    const ext = finalBlob.type === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '');
    return new File([finalBlob], `${baseName}.${ext}`, { type: finalBlob.type });
  } catch (err) {
    console.warn('Não foi possível comprimir a imagem, enviando original:', err);
    return file;
  }
};

export default compressImage;
