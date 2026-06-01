/**
 * Precomputed phone models as procedural geometry
 * Each model contains instructions to build a realistic 3D phone
 */

export interface PhoneModelData {
  name: string;
  width: number;
  height: number;
  depth: number;
  cornerRadius: number;
  bodyColor: { r: number; g: number; b: number };
  cameraSize: number;
  cameraPosition: { x: number; y: number };
  hasNotch: boolean;
  bezelSize: number;
}

export const phoneModels: Record<string, PhoneModelData> = {
  // iPhone Pro Max models (largest)
  'iphone-pro-max': {
    name: 'iPhone Pro Max',
    width: 440,
    height: 956,
    depth: 12,
    cornerRadius: 50,
    bodyColor: { r: 0.1, g: 0.1, b: 0.1 }, // Dark titanium
    cameraSize: 70,
    cameraPosition: { x: -60, y: -140 },
    hasNotch: true,
    bezelSize: 14,
  },

  // iPhone Pro models
  'iphone-pro': {
    name: 'iPhone Pro',
    width: 392,
    height: 852,
    depth: 12,
    cornerRadius: 50,
    bodyColor: { r: 0.1, g: 0.1, b: 0.1 }, // Dark titanium
    cameraSize: 65,
    cameraPosition: { x: -55, y: -120 },
    hasNotch: true,
    bezelSize: 12,
  },

  // iPhone Plus models
  'iphone-plus': {
    name: 'iPhone Plus',
    width: 440,
    height: 956,
    depth: 11,
    cornerRadius: 50,
    bodyColor: { r: 0.15, g: 0.15, b: 0.15 }, // Medium gray
    cameraSize: 60,
    cameraPosition: { x: -60, y: -140 },
    hasNotch: true,
    bezelSize: 12,
  },

  // iPhone Standard models
  'iphone-standard': {
    name: 'iPhone Standard',
    width: 392,
    height: 852,
    depth: 11,
    cornerRadius: 50,
    bodyColor: { r: 0.15, g: 0.15, b: 0.15 }, // Medium gray
    cameraSize: 55,
    cameraPosition: { x: -55, y: -120 },
    hasNotch: true,
    bezelSize: 12,
  },

  // iPhone Mini models
  'iphone-mini': {
    name: 'iPhone Mini',
    width: 360,
    height: 780,
    depth: 11,
    cornerRadius: 41,
    bodyColor: { r: 0.15, g: 0.15, b: 0.15 }, // Medium gray
    cameraSize: 50,
    cameraPosition: { x: -50, y: -100 },
    hasNotch: true,
    bezelSize: 11,
  },
};

/**
 * Get model data for a device
 */
export function getPhoneModelData(deviceId: string): PhoneModelData | undefined {
  // Extract model type from device ID (e.g., 'iphone17-pro' -> 'iphone-pro')
  const modelType = deviceId
    .replace(/iphone\d+-/, 'iphone-') // Remove generation number
    .toLowerCase();

  return phoneModels[modelType];
}
