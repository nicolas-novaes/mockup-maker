import type { EasingFunction, Keyframe } from './types';
import { lerp, lerpVector } from './utils-animation';

/**
 * Easing functions implementation
 */
const easingFunctions: Record<EasingFunction, (t: number) => number> = {
  linear: (t) => t,

  // Quadratic
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, 3),
  easeInOutCubic: (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Quartic
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
  easeInOutQuart: (t) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,

  // Quintic
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => 1 - Math.pow(1 - t, 5),
  easeInOutQuint: (t) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2,

  // Exponential
  easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) =>
    t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? Math.pow(2, 20 * t - 10) / 2
          : (2 - Math.pow(2, -20 * t + 10)) / 2,

  // Circular
  easeInCirc: (t) => 1 - Math.sqrt(1 - Math.pow(t, 2)),
  easeOutCirc: (t) => Math.sqrt(1 - Math.pow(t - 1, 2)),
  easeInOutCirc: (t) =>
    t < 0.5
      ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
      : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2,

  // Back
  easeInBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeInElastic: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c5 = (2 * Math.PI) / 4.5;
    return t < 0.5
      ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
      : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },

  // Bounce
  easeOutBounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  easeInBounce: (t) => 1 - easingFunctions.easeOutBounce(1 - t),
  easeInOutBounce: (t) =>
    t < 0.5
      ? (1 - easingFunctions.easeOutBounce(1 - 2 * t)) / 2
      : (1 + easingFunctions.easeOutBounce(2 * t - 1)) / 2,
};

/**
 * Apply easing function to a normalized time value
 */
export function applyEasing(
  normalizedTime: number,
  easingFunction: EasingFunction = 'linear'
): number {
  const easer = easingFunctions[easingFunction] || easingFunctions.linear;
  return easer(normalizedTime);
}

/**
 * Find two keyframes that bracket the given time
 */
export function findKeyframeBracket(
  keyframes: Keyframe[],
  time: number
): [Keyframe | null, Keyframe | null] {
  if (keyframes.length === 0) return [null, null];
  if (keyframes.length === 1) return [keyframes[0], null];

  let before: Keyframe | null = null;
  let after: Keyframe | null = null;

  for (let i = 0; i < keyframes.length; i++) {
    if (keyframes[i].time <= time) {
      before = keyframes[i];
    }
    if (keyframes[i].time >= time && after === null) {
      after = keyframes[i];
      break;
    }
  }

  return [before, after];
}

/**
 * Interpolate keyframe properties at a specific time
 */
export function interpolateKeyframes(
  keyframes: Keyframe[],
  time: number
): Partial<Keyframe> {
  if (keyframes.length === 0) {
    return {};
  }

  const [before, after] = findKeyframeBracket(keyframes, time);

  // No interpolation needed
  if (!before || !after || before === after) {
    const kf = before || after;
    return {
      position: kf?.position,
      rotation: kf?.rotation,
      scale: kf?.scale,
      opacity: kf?.opacity,
    };
  }

  // Interpolate between before and after keyframes
  const timeDiff = after.time - before.time;
  const localTime = time - before.time;
  const t = timeDiff > 0 ? localTime / timeDiff : 0;

  const easing = before.easing || 'linear';
  const easedT = applyEasing(t, easing);

  const result: Partial<Keyframe> = {};

  // Interpolate position
  if (before.position && after.position) {
    result.position = lerpVector(before.position, after.position, easedT);
  }

  // Interpolate rotation
  if (before.rotation && after.rotation) {
    result.rotation = lerpVector(before.rotation, after.rotation, easedT);
  }

  // Interpolate scale
  if (before.scale && after.scale) {
    result.scale = lerpVector(before.scale, after.scale, easedT);
  }

  // Interpolate opacity
  if (before.opacity !== undefined && after.opacity !== undefined) {
    result.opacity = lerp(before.opacity, after.opacity, easedT);
  }

  return result;
}

/**
 * Get the total duration of keyframes
 */
export function getKeyframesDuration(keyframes: Keyframe[]): number {
  if (keyframes.length === 0) return 0;
  return Math.max(...keyframes.map((kf) => kf.time));
}

/**
 * Sort keyframes by time
 */
export function sortKeyframesByTime(keyframes: Keyframe[]): Keyframe[] {
  return [...keyframes].sort((a, b) => a.time - b.time);
}

/**
 * Remove keyframes within a time range
 */
export function removeKeyframesInRange(
  keyframes: Keyframe[],
  startTime: number,
  endTime: number
): Keyframe[] {
  return keyframes.filter(
    (kf) => kf.time < startTime || kf.time > endTime
  );
}

/**
 * Shift keyframes by a time offset
 */
export function shiftKeyframesByTime(
  keyframes: Keyframe[],
  offset: number
): Keyframe[] {
  return keyframes.map((kf) => ({
    ...kf,
    time: Math.max(0, kf.time + offset),
  }));
}

/**
 * Scale keyframes duration
 */
export function scaleKeyframesDuration(
  keyframes: Keyframe[],
  scaleFactor: number
): Keyframe[] {
  return keyframes.map((kf) => ({
    ...kf,
    time: kf.time * scaleFactor,
  }));
}
