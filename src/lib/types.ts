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
  modelUrl?: string; // URL to GLTF model file
  screenMeshName?: string; // Name of the mesh that represents the screen (optional, for GLTF models)
  screenMaterialName?: string; // Name of the material that represents the screen (fallback when mesh names are generic)
  screenRotation?: number; // Degrees to rotate the texture (0, 90, 180, 270)
  screenFlipX?: boolean; // Mirror the texture horizontally
  initialRotation?: { x: number; y: number; z: number }; // Rotation applied to gltf.scene to face forward
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

// Background config
export type BackgroundConfig =
  | { type: 'solid'; color: string }
  | { type: 'gradient'; gradientType: 'linear' | 'radial'; colorStart: string; colorEnd: string; angle: number; centerX: number; centerY: number }
  | { type: 'image'; dataURL: string }
  | { type: 'transparent' };

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
