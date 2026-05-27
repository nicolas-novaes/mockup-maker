import type { AnimationTemplate } from './types';

export const animationTemplates: AnimationTemplate[] = [
  {
    id: 'template-top-turn',
    name: 'Top Turn',
    displayName: 'Top Turn',
    description: 'Device rotates around the top edge',
    category: 'rotate',
    defaultDuration: 1500,
    defaultKeyframes: [
      {
        time: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 1500,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 90, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
    ],
    tags: ['rotation', 'perspective', '3d'],
  },

  {
    id: 'template-bottom-turn',
    name: 'Bottom Turn',
    displayName: 'Bottom Turn',
    description: 'Device rotates around the bottom edge',
    category: 'rotate',
    defaultDuration: 1500,
    defaultKeyframes: [
      {
        time: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 1500,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: -90, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
    ],
    tags: ['rotation', 'perspective', '3d'],
  },

  {
    id: 'template-flip-in',
    name: 'Flip In',
    displayName: 'Flip In',
    description: 'Device flips in from the side',
    category: 'flip',
    defaultDuration: 1200,
    defaultKeyframes: [
      {
        time: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 90, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 0,
        easing: 'easeOut',
      },
      {
        time: 1200,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    tags: ['flip', 'entrance', '3d'],
  },

  {
    id: 'template-flip-up',
    name: 'Flip Up',
    displayName: 'Flip Up',
    description: 'Device flips upward in place',
    category: 'flip',
    defaultDuration: 1200,
    defaultKeyframes: [
      {
        time: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 600,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: -90, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 1200,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
    ],
    tags: ['flip', 'rotation', '3d'],
  },

  {
    id: 'template-pan-across',
    name: 'Pan Across',
    displayName: 'Pan Across',
    description: 'Device pans horizontally across the screen',
    category: 'pan',
    defaultDuration: 1500,
    defaultKeyframes: [
      {
        time: 0,
        position: { x: -200, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 1500,
        position: { x: 200, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
    ],
    tags: ['movement', 'pan', 'horizontal'],
  },

  {
    id: 'template-hover',
    name: 'Hover',
    displayName: 'Hover',
    description: 'Device hovers with gentle bobbing motion',
    category: 'movement',
    defaultDuration: 2000,
    defaultKeyframes: [
      {
        time: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 500,
        position: { x: 0, y: -20, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 1000,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 1500,
        position: { x: 0, y: -20, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 2000,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
    ],
    tags: ['movement', 'subtle', 'loopable'],
  },

  {
    id: 'template-slide-in',
    name: 'Slide In',
    displayName: 'Slide In',
    description: 'Device slides in from the bottom',
    category: 'entrance',
    defaultDuration: 1000,
    defaultKeyframes: [
      {
        time: 0,
        position: { x: 0, y: 300, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 0,
        easing: 'easeOut',
      },
      {
        time: 1000,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeOut',
      },
    ],
    tags: ['entrance', 'movement', 'vertical'],
  },

  {
    id: 'template-dangle',
    name: 'Dangle',
    displayName: 'Dangle',
    description: 'Device dangles and swings like a pendulum',
    category: 'rotation',
    defaultDuration: 2000,
    defaultKeyframes: [
      {
        time: 0,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 500,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 20 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 1000,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 1500,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: -20 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
      {
        time: 2000,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      },
    ],
    tags: ['rotation', 'swing', 'playful'],
  },
];

/**
 * Get a template by its ID
 */
export function getTemplateById(id: string): AnimationTemplate | undefined {
  return animationTemplates.find((template) => template.id === id);
}

/**
 * Get templates filtered by category
 */
export function getTemplatesByCategory(
  category: string
): AnimationTemplate[] {
  return animationTemplates.filter((template) => template.category === category);
}

/**
 * Get all unique categories
 */
export function getTemplateCategories(): string[] {
  const categories = new Set(animationTemplates.map((t) => t.category));
  return Array.from(categories).sort();
}

/**
 * Get default template
 */
export function getDefaultTemplate(): AnimationTemplate {
  return animationTemplates[0]; // Top Turn
}
