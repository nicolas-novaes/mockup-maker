/**
 * Linear interpolation between two values
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Interpolate between two 3D vectors
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export function lerpVector(
  a: Vector3,
  b: Vector3,
  t: number
): Vector3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Format duration in milliseconds to a readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}

/**
 * Convert milliseconds to seconds
 */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}

/**
 * Convert seconds to milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Calculate frames count based on duration and FPS
 */
export function calculateFrameCount(durationMs: number, fps: number): number {
  return Math.ceil((durationMs / 1000) * fps);
}

/**
 * Get time at a specific frame
 */
export function getTimeAtFrame(frameIndex: number, fps: number): number {
  return (frameIndex / fps) * 1000;
}

/**
 * Normalize time to 0-1 range based on duration
 */
export function normalizeTime(currentMs: number, durationMs: number): number {
  return clamp(currentMs / durationMs, 0, 1);
}

/**
 * Denormalize time from 0-1 range to milliseconds
 */
export function denormalizeTime(normalized: number, durationMs: number): number {
  return normalized * durationMs;
}
