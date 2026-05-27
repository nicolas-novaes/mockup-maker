import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export animation utilities
export { lerp, lerpVector, clamp, formatDuration, msToSeconds, secondsToMs, calculateFrameCount, getTimeAtFrame, normalizeTime, denormalizeTime, type Vector3 } from './utils-animation'
