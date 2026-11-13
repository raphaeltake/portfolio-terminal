/** SHA-256 em hexadecimal usando Web Crypto (requer HTTPS ou localhost). */
export async function sha256Hex(value: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto indisponível: acesse o site via HTTPS ou localhost.');
  }
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Faz o download de um texto como arquivo. */
export function downloadTextFile(filename: string, content: string, mime = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Lê uma imagem enviada pelo usuário, redimensiona e devolve como data URL
 * JPEG/PNG compacta — evita estourar o limite (~5 MB) do localStorage.
 */
export async function imageFileToDataUrl(file: File, maxWidth = 1200, quality = 0.82) {
  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo selecionado não é uma imagem.');
  }

  const source = await readAsDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);

  const keepTransparency = file.type === 'image/png' || file.type === 'image/svg+xml';
  return keepTransparency ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Imagem inválida.'));
    image.src = src;
  });
}
