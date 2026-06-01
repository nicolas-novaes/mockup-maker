/**
 * Figma API utilities for importing frames as screenshots
 */

const FIGMA_API_BASE = 'https://api.figma.com/v1';
const TOKEN_KEY = 'figma_pat';

/**
 * Parse a Figma URL to extract fileKey and nodeId
 * Supports formats:
 *   https://figma.com/design/:fileKey/:fileName?node-id=:nodeId
 *   https://www.figma.com/design/:fileKey/:fileName?node-id=:nodeId
 *   https://figma.com/file/:fileKey/:fileName?node-id=:nodeId
 */
export function parseFigmaUrl(url: string): { fileKey: string; nodeId: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('figma.com')) return null;

    // Extract fileKey from path: /design/:fileKey/:name or /file/:fileKey/:name
    const pathMatch = parsed.pathname.match(/\/(design|file)\/([^/]+)/);
    if (!pathMatch) return null;

    const fileKey = pathMatch[2];

    // Extract nodeId from query params
    const nodeId = parsed.searchParams.get('node-id');
    if (!nodeId) return null;

    // Convert "1-2" format to "1:2" (Figma API expects colon)
    const normalizedNodeId = nodeId.replace('-', ':');

    return { fileKey, nodeId: normalizedNodeId };
  } catch {
    return null;
  }
}

/**
 * Fetch a screenshot of a Figma node using the Images API
 */
export async function fetchFigmaScreenshot(
  fileKey: string,
  nodeId: string,
  token: string
): Promise<string> {
  const response = await fetch(
    `${FIGMA_API_BASE}/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=png&scale=2`,
    {
      headers: {
        'X-Figma-Token': token,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Token inválido ou sem permissão para acessar este arquivo.');
    }
    if (response.status === 404) {
      throw new Error('Arquivo ou frame não encontrado.');
    }
    throw new Error(`Erro na API do Figma: ${response.status}`);
  }

  const data = await response.json();

  if (data.err) {
    throw new Error(`Erro do Figma: ${data.err}`);
  }

  const imageUrl = data.images?.[nodeId];
  if (!imageUrl) {
    throw new Error('Não foi possível gerar a imagem do frame selecionado.');
  }

  return imageUrl;
}

/**
 * Load an image URL and convert to base64 data URL
 */
export async function loadImageAsDataURL(imageUrl: string): Promise<{ dataURL: string; width: number; height: number }> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Falha ao baixar a imagem do Figma.');
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataURL = reader.result as string;
      // Get dimensions
      const img = new Image();
      img.onload = () => {
        resolve({ dataURL, width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error('Falha ao processar a imagem.'));
      img.src = dataURL;
    };
    reader.onerror = () => reject(new Error('Falha ao converter a imagem.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Get saved Figma token from localStorage
 */
export function getFigmaToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save Figma token to localStorage
 */
export function saveFigmaToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove Figma token from localStorage
 */
export function clearFigmaToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
