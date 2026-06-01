import type { Device } from './types';

export const iPhoneDevices: Device[] = [
  // iPhone 17
  {
    id: 'iphone17-pro',
    name: 'iPhone 17 Pro',
    displayName: 'iPhone 17 Pro',
    width: 392,
    height: 852,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 214, height: 32 },
    modelUrl: '/models/iphone17-pro/scene.gltf',
    screenMeshName: 'Cube_screen_0',
    initialRotation: { x: 0, y: -Math.PI * 0.8, z: 0 },
  },
  {
    id: 'iphone17-air',
    name: 'iPhone 17 Air',
    displayName: 'iPhone 17 Air',
    width: 392,
    height: 852,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 214, height: 32 },
    modelUrl: '/models/iphone17-air/scene.gltf',
    screenMeshName: 'Object_7',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
  {
    id: 'iphone17-pro-max',
    name: 'iPhone 17 Pro Max',
    displayName: 'iPhone 17 Pro Max',
    width: 440,
    height: 956,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone17-pro-max/scene.gltf',
    screenMeshName: 'Cube010_screen001_0',
    initialRotation: { x: 0, y: Math.PI / 2, z: 0 },
  },

  // iPhone 16
  {
    id: 'iphone16-pro-max',
    name: 'iPhone 16 Pro Max',
    displayName: 'iPhone 16 Pro Max',
    width: 440,
    height: 956,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone16-pro-max-new/scene.gltf',
    screenMeshName: 'Object_32',
    initialRotation: { x: 0, y: Math.PI / 2, z: 0 },
  },
  {
    id: 'iphone16-pro',
    name: 'iPhone 16 Pro',
    displayName: 'iPhone 16 Pro',
    width: 392,
    height: 852,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone16-pro-new/scene.gltf',
    screenMeshName: 'Object_61',
  },
  {
    id: 'iphone16-plus',
    name: 'iPhone 16 Plus',
    displayName: 'iPhone 16 Plus',
    width: 440,
    height: 956,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone16-plus/scene.gltf',
    screenMaterialName: 'Screen_BG',
  },
  {
    id: 'iphone16',
    name: 'iPhone 16',
    displayName: 'iPhone 16',
    width: 392,
    height: 852,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone16/iphone16.gltf',
    screenMeshName: 'Object_18',
  },

  // iPhone 15
  {
    id: 'iphone15-pro-max',
    name: 'iPhone 15 Pro Max',
    displayName: 'iPhone 15 Pro Max',
    width: 440,
    height: 956,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone15-pro-max/scene.gltf',
    screenMeshName: 'xuumQFYYicplRrq',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
  {
    id: 'iphone15-pro',
    name: 'iPhone 15 Pro',
    displayName: 'iPhone 15 Pro',
    width: 392,
    height: 852,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone15-pro/scene.gltf',
    screenMeshName: 'Object_81',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
  {
    id: 'iphone15',
    name: 'iPhone 15',
    displayName: 'iPhone 15',
    width: 392,
    height: 852,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone15/scene.gltf',
    screenMeshName: 'Object_31',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },

  // iPhone 14
  {
    id: 'iphone14-pro-max',
    name: 'iPhone 14 Pro Max',
    displayName: 'iPhone 14 Pro Max',
    width: 440,
    height: 956,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 209, height: 32 },
    modelUrl: '/models/iphone14-pro-max/scene.gltf',
    screenMeshName: 'LLCOsMNMwTSiaFM_0',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
  {
    id: 'iphone14-pro',
    name: 'iPhone 14 Pro',
    displayName: 'iPhone 14 Pro',
    width: 392,
    height: 852,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 209, height: 32 },
    modelUrl: '/models/iphone14-pro/scene.gltf',
    screenMeshName: 'Object_13',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
  {
    id: 'iphone14-plus',
    name: 'iPhone 14 Plus',
    displayName: 'iPhone 14 Plus',
    width: 440,
    height: 956,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone14-plus/scene.gltf',
    screenMeshName: 'XPAbNDtHsLUZaeo',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
  {
    id: 'iphone14',
    name: 'iPhone 14',
    displayName: 'iPhone 14',
    width: 392,
    height: 852,
    scale: 3,
    cornerRadius: 50,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 212, height: 32 },
    modelUrl: '/models/iphone14/scene.gltf',
    screenMeshName: 'AuuOKcgUGrLfpna',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },

  // iPhone 13
  {
    id: 'iphone13-pro-max',
    name: 'iPhone 13 Pro Max',
    displayName: 'iPhone 13 Pro Max',
    width: 428,
    height: 926,
    scale: 3,
    cornerRadius: 47,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 203, height: 32 },
    modelUrl: '/models/iphone13-pro-max/scene.gltf',
    screenMeshName: 'Body_Wallpaper_0',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
  {
    id: 'iphone13-pro',
    name: 'iPhone 13 Pro',
    displayName: 'iPhone 13 Pro',
    width: 390,
    height: 844,
    scale: 3,
    cornerRadius: 47,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 203, height: 32 },
    modelUrl: '/models/iphone13-pro/scene.gltf',
    screenMeshName: 'Body002_Wallpaper_0',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
  {
    id: 'iphone13-mini',
    name: 'iPhone 13 mini',
    displayName: 'iPhone 13 mini',
    width: 360,
    height: 780,
    scale: 3,
    cornerRadius: 41,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 175, height: 32 },
    modelUrl: '/models/iphone13-mini/scene.gltf',
    screenMeshName: 'Object_22',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
  {
    id: 'iphone13',
    name: 'iPhone 13',
    displayName: 'iPhone 13',
    width: 390,
    height: 844,
    scale: 3,
    cornerRadius: 47,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    notch: { width: 203, height: 32 },
    modelUrl: '/models/iphone13/scene.gltf',
    screenMeshName: 'Object_10',
    initialRotation: { x: 0, y: -Math.PI / 2, z: 0 },
  },
];

export const iPadDevices: Device[] = [
  {
    id: 'ipad-pro',
    name: 'iPad Pro',
    displayName: 'iPad Pro (2020)',
    width: 1024,
    height: 1366,
    scale: 2,
    cornerRadius: 18,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    modelUrl: '/models/ipad-pro/scene.gltf',
    screenMeshName: 'iPad_Pro_2020_screen_0',
  },
  {
    id: 'ipad-mini',
    name: 'iPad mini',
    displayName: 'iPad mini (6th gen)',
    width: 744,
    height: 1133,
    scale: 2,
    cornerRadius: 21,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    modelUrl: '/models/ipad-mini/scene.gltf',
    screenMeshName: 'iPad_Mini_Screen_0',
    initialRotation: { x: 0, y: Math.PI, z: 0 },
  },
];

export const macBookDevices: Device[] = [
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16"',
    displayName: 'MacBook Pro 16" (M3)',
    width: 3456,
    height: 2234,
    scale: 2,
    cornerRadius: 12,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    modelUrl: '/models/macbook-pro-16/scene.gltf',
    screenMeshName: 'Object_123',
    screenRotation: 90,
  },
  {
    id: 'macbook-pro-14',
    name: 'MacBook Pro 14"',
    displayName: 'MacBook Pro 14" (M5)',
    width: 3024,
    height: 1964,
    scale: 2,
    cornerRadius: 12,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    modelUrl: '/models/macbook-pro-14/scene.gltf',
    screenMeshName: 'Object_107',
    screenRotation: 90,
  },
  {
    id: 'macbook-air',
    name: 'MacBook Air',
    displayName: 'MacBook Air (M2)',
    width: 2560,
    height: 1664,
    scale: 2,
    cornerRadius: 12,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    modelUrl: '/models/macbook-air/scene.gltf',
    screenMeshName: 'Object_4',
    screenRotation: 90,
  },
];

export const androidDevices: Device[] = [
  {
    id: 'galaxy-s25-ultra',
    name: 'Galaxy S25 Ultra',
    displayName: 'Samsung Galaxy S25 Ultra',
    width: 440,
    height: 956,
    scale: 3,
    cornerRadius: 45,
    bezels: { top: 12, bottom: 12, left: 12, right: 12 },
    modelUrl: '/models/galaxy-s25-ultra/scene.gltf',
    screenMeshName: 'Object_22',
  },
];

/**
 * Get a device by its ID
 */
export function getDeviceById(id: string): Device | undefined {
  return allDevices.find((device) => device.id === id);
}

/**
 * Get all devices filtered by category
 */
export function getDevicesByGeneration(generation: number): Device[] {
  const generationMap: Record<number, string> = {
    17: 'iphone17',
    16: 'iphone16',
    15: 'iphone15',
    14: 'iphone14',
    13: 'iphone13',
  };

  const prefix = generationMap[generation];
  if (!prefix) return [];

  return iPhoneDevices.filter((device) => device.id.startsWith(prefix));
}

/**
 * Get default device (latest generation, standard model)
 */
export function getDefaultDevice(): Device {
  return iPhoneDevices[0];
}

/**
 * Export devices for use in components
 */
export const allDevices = [...iPhoneDevices, ...iPadDevices, ...macBookDevices, ...androidDevices];
