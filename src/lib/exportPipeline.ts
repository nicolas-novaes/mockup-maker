import type { Animation } from './types';

export async function exportToMP4(
  _canvas: HTMLCanvasElement,
  _animation: Animation,
  _fps?: number,
  _quality?: 'hd' | '4k',
  onProgress?: (progress: number) => void
): Promise<Blob> {
  // MVP: Placeholder - just create a small dummy blob for now
  // Full implementation deferred to post-MVP
  onProgress?.(100);
  return new Blob(['mock video data'], { type: 'video/mp4' });
}

export async function exportToGIF(
  _canvas: HTMLCanvasElement,
  _animation: Animation,
  _fps?: number
): Promise<Blob> {
  // MVP: Placeholder
  return new Blob(['mock gif data'], { type: 'image/gif' });
}

export async function exportToPNG(
  _canvas: HTMLCanvasElement,
  _animation: Animation
): Promise<Blob> {
  // MVP: Placeholder
  return new Blob(['mock png data'], { type: 'image/png' });
}
