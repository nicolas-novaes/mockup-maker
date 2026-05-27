// Easing functions
export type EasingFunction =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'
  | 'easeInCirc'
  | 'easeOutCirc'
  | 'easeInOutCirc'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'
  | 'easeInBounce'
  | 'easeOutBounce'
  | 'easeInOutBounce';

// Device specifications
export interface Device {
  id: string;
  name: string;
  displayName: string;
  width: number;
  height: number;
  scale: number;
  cornerRadius: number;
  bezels: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  notch?: {
    width: number;
    height: number;
  };
}

// Screenshot
export interface Screenshot {
  id: string;
  data: string; // Base64 encoded image data
  width: number;
  height: number;
  mimeType: string;
  uploadedAt: number;
}

// Keyframe for animation
export interface Keyframe {
  id: string;
  time: number; // milliseconds
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  opacity?: number;
  easing?: EasingFunction;
}

// Animation configuration
export interface Animation {
  id: string;
  templateId: string;
  name: string;
  duration: number; // milliseconds
  keyframes: Keyframe[];
  loop: boolean;
  autoPlay: boolean;
}

// Export settings
export interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif' | 'apng';
  quality: number; // 0-100
  fps: number;
  width: number;
  height: number;
  transparency: boolean;
  loop: boolean;
  codec?: string;
  bitrate?: number;
}

// Animation template
export interface AnimationTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  defaultDuration: number;
  defaultKeyframes: Omit<Keyframe, 'id'>[];
  previewGif?: string;
  tags: string[];
}
