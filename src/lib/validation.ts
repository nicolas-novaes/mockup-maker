import { Screenshot } from './types';

/**
 * Validate screenshot object
 */
export function validateScreenshot(screenshot: Screenshot): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!screenshot.id || typeof screenshot.id !== 'string') {
    errors.push('Screenshot must have a valid ID');
  }

  if (!screenshot.data || typeof screenshot.data !== 'string') {
    errors.push('Screenshot must have base64 encoded data');
  }

  if (!screenshot.data.startsWith('data:image')) {
    errors.push('Screenshot data must be a valid data URL');
  }

  if (
    !Number.isFinite(screenshot.width) ||
    screenshot.width <= 0
  ) {
    errors.push('Screenshot width must be a positive number');
  }

  if (
    !Number.isFinite(screenshot.height) ||
    screenshot.height <= 0
  ) {
    errors.push('Screenshot height must be a positive number');
  }

  if (!screenshot.mimeType || typeof screenshot.mimeType !== 'string') {
    errors.push('Screenshot must have a valid MIME type');
  }

  const validMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validMimeTypes.includes(screenshot.mimeType)) {
    errors.push(
      `Screenshot MIME type must be one of: ${validMimeTypes.join(', ')}`
    );
  }

  if (
    !Number.isFinite(screenshot.uploadedAt) ||
    screenshot.uploadedAt <= 0
  ) {
    errors.push('Screenshot must have a valid upload timestamp');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  width: number,
  height: number,
  options?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    aspectRatioRange?: { min: number; max: number };
  }
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  const minWidth = options?.minWidth ?? 100;
  const maxWidth = options?.maxWidth ?? 8192;
  const minHeight = options?.minHeight ?? 100;
  const maxHeight = options?.maxHeight ?? 8192;

  if (!Number.isFinite(width) || width <= 0) {
    errors.push('Width must be a positive number');
  }

  if (!Number.isFinite(height) || height <= 0) {
    errors.push('Height must be a positive number');
  }

  if (width < minWidth) {
    errors.push(`Width must be at least ${minWidth}px`);
  }

  if (width > maxWidth) {
    errors.push(`Width must not exceed ${maxWidth}px`);
  }

  if (height < minHeight) {
    errors.push(`Height must be at least ${minHeight}px`);
  }

  if (height > maxHeight) {
    errors.push(`Height must not exceed ${maxHeight}px`);
  }

  if (options?.aspectRatioRange) {
    const aspectRatio = width / height;
    const { min, max } = options.aspectRatioRange;

    if (aspectRatio < min || aspectRatio > max) {
      errors.push(
        `Aspect ratio must be between ${min}:1 and ${max}:1 (current: ${aspectRatio.toFixed(2)}:1)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if WebGL is supported
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl !== null && gl !== undefined;
  } catch {
    return false;
  }
}

/**
 * Check if WebGL 2 is supported
 */
export function isWebGL2Supported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    return gl !== null && gl !== undefined;
  } catch {
    return false;
  }
}

/**
 * Get supported WebGL extensions
 */
export function getWebGLExtensions(): string[] {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return [];
    return gl.getSupportedExtensions() || [];
  } catch {
    return [];
  }
}

/**
 * Validate export format support
 */
export function isExportFormatSupported(format: 'mp4' | 'webm' | 'gif' | 'apng'): boolean {
  // Check browser support for video codecs
  const video = document.createElement('video');

  switch (format) {
    case 'mp4':
      return video.canPlayType('video/mp4; codecs="avc1.42E01E"') !== '';
    case 'webm':
      return video.canPlayType('video/webm; codecs="vp8, vorbis"') !== '';
    case 'gif':
      // GIF is always supported
      return true;
    case 'apng':
      // Check if APNG is supported
      return document.createElement('canvas').toDataURL('image/apng') !== '';
    default:
      return false;
  }
}

/**
 * Validate export settings
 */
export function validateExportSettings(settings: {
  format?: string;
  quality?: number;
  fps?: number;
  width?: number;
  height?: number;
}): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (settings.format) {
    const validFormats = ['mp4', 'webm', 'gif', 'apng'];
    if (!validFormats.includes(settings.format)) {
      errors.push(`Format must be one of: ${validFormats.join(', ')}`);
    }
  }

  if (settings.quality !== undefined) {
    if (!Number.isFinite(settings.quality) || settings.quality < 0 || settings.quality > 100) {
      errors.push('Quality must be a number between 0 and 100');
    }
  }

  if (settings.fps !== undefined) {
    if (!Number.isFinite(settings.fps) || settings.fps < 1 || settings.fps > 120) {
      errors.push('FPS must be a number between 1 and 120');
    }
  }

  if (settings.width !== undefined) {
    if (!Number.isFinite(settings.width) || settings.width < 100 || settings.width > 4096) {
      errors.push('Width must be a number between 100 and 4096');
    }
  }

  if (settings.height !== undefined) {
    if (!Number.isFinite(settings.height) || settings.height < 100 || settings.height > 4096) {
      errors.push('Height must be a number between 100 and 4096');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Estimate file size for export
 */
export function estimateExportSize(
  durationMs: number,
  fps: number,
  width: number,
  height: number,
  format: 'mp4' | 'webm' | 'gif' | 'apng' = 'mp4'
): number {
  const frameCount = (durationMs / 1000) * fps;
  const pixelCount = width * height;

  // Very rough estimates in bytes per frame
  const bytesPerFrameEstimates: Record<string, number> = {
    mp4: 1000, // ~1KB per frame
    webm: 1500, // ~1.5KB per frame
    gif: 3000, // ~3KB per frame (GIFs are generally larger)
    apng: 2000, // ~2KB per frame
  };

  const bytesPerFrame = bytesPerFrameEstimates[format] || 1000;
  const estimatedBytes = frameCount * bytesPerFrame;

  return estimatedBytes;
}

/**
 * Format bytes to human readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
