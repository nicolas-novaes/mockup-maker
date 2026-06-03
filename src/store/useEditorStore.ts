import { create } from 'zustand';
import type {
  Screenshot,
  Device,
  ExportSettings,
  BackgroundConfig,
} from '../lib/types';
import type { RenderEngine } from '../lib/renderEngine';
import { getDeviceById } from '../lib/deviceData';

export interface EditorState {
  // Core state
  screenshot: Screenshot | null;
  selectedDevice: Device | null;
  exportSettings: ExportSettings;

  // Light Config
  lightConfig: {
    azimuth: number;
    elevation: number;
    intensity: number;
    shadowEnabled: boolean;
  };

  // Screenshot transform
  screenshotRotation: number; // 0, 90, 180, 270
  screenshotFlipped: boolean;

  // Background Config
  backgroundConfig: BackgroundConfig;

  // Actions
  setScreenshot: (screenshot: Screenshot) => void;
  clearScreenshot: () => void;
  rotateScreenshot: () => void;
  flipScreenshot: () => void;
  selectDevice: (device: Device) => void;
  updateExportSettings: (settings: Partial<ExportSettings>) => void;
  setLightConfig: (config: Partial<EditorState['lightConfig']>) => void;
  setBackgroundConfig: (config: BackgroundConfig) => void;

  // Render engine reference
  renderEngine: RenderEngine | null;
  setRenderEngine: (engine: RenderEngine | null) => void;
}

const defaultExportSettings: ExportSettings = {
  format: 'mp4',
  quality: 90,
  fps: 60,
  width: 1080,
  height: 1920,
  transparency: false,
  loop: true,
};

const defaultLightConfig = {
  azimuth: 45,
  elevation: 45,
  intensity: 1.5,
  shadowEnabled: true,
};

const defaultBackgroundConfig: BackgroundConfig = {
  type: 'solid',
  color: '#111111',
};

export const useEditorStore = create<EditorState>((set) => ({
  // Initial state
  screenshot: null,
  selectedDevice: getDeviceById('iphone16') || null,
  exportSettings: defaultExportSettings,
  lightConfig: defaultLightConfig,
  screenshotRotation: 0,
  screenshotFlipped: false,
  backgroundConfig: defaultBackgroundConfig,
  renderEngine: null,

  // Actions
  setScreenshot: (screenshot: Screenshot) =>
    set({ screenshot }),

  clearScreenshot: () =>
    set({ screenshot: null, screenshotRotation: 0, screenshotFlipped: false }),

  rotateScreenshot: () =>
    set((state) => ({ screenshotRotation: (state.screenshotRotation + 90) % 360 })),

  flipScreenshot: () =>
    set((state) => ({ screenshotFlipped: !state.screenshotFlipped })),

  selectDevice: (device: Device) =>
    set({ selectedDevice: device }),

  updateExportSettings: (settings: Partial<ExportSettings>) =>
    set((state) => ({
      exportSettings: {
        ...state.exportSettings,
        ...settings,
      },
    })),

  setLightConfig: (config) =>
    set((state) => ({
      lightConfig: {
        ...state.lightConfig,
        ...config,
      },
    })),

  setBackgroundConfig: (config) =>
    set({ backgroundConfig: config }),

  setRenderEngine: (engine) =>
    set({ renderEngine: engine }),
}));
