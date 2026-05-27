import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Screenshot,
  Device,
  Animation,
  Keyframe,
  AnimationTemplate,
  ExportSettings,
} from '../lib/types';

export interface EditorState {
  // Core state
  screenshot: Screenshot | null;
  selectedDevice: Device | null;
  selectedTemplate: AnimationTemplate | null;
  currentAnimation: Animation | null;
  selectedKeyframeId: string | null;
  exportSettings: ExportSettings;
  isPreviewPlaying: boolean;
  previewProgress: number; // 0-1

  // Actions
  setScreenshot: (screenshot: Screenshot) => void;
  clearScreenshot: () => void;
  selectDevice: (device: Device) => void;
  selectTemplate: (template: AnimationTemplate) => void;
  updateKeyframe: (keyframeId: string, updates: Partial<Keyframe>) => void;
  addKeyframe: (time: number) => void;
  deleteKeyframe: (keyframeId: string) => void;
  updateExportSettings: (settings: Partial<ExportSettings>) => void;
  setPreviewPlaying: (playing: boolean) => void;
  setPreviewProgress: (progress: number) => void;
  selectKeyframe: (keyframeId: string | null) => void;
  duplicateKeyframe: (keyframeId: string) => void;
  resetAnimation: () => void;
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

export const useEditorStore = create<EditorState>((set) => ({
  // Initial state
  screenshot: null,
  selectedDevice: null,
  selectedTemplate: null,
  currentAnimation: null,
  selectedKeyframeId: null,
  exportSettings: defaultExportSettings,
  isPreviewPlaying: false,
  previewProgress: 0,

  // Actions
  setScreenshot: (screenshot: Screenshot) =>
    set((state) => {
      // Reset animation when new screenshot is set
      const newAnimation: Animation = {
        id: uuidv4(),
        templateId: state.selectedTemplate?.id || '',
        name: `Animation ${new Date().toLocaleTimeString()}`,
        duration: state.selectedTemplate?.defaultDuration || 1000,
        keyframes: state.selectedTemplate?.defaultKeyframes?.map((kf) => ({
          ...kf,
          id: uuidv4(),
        })) || [],
        loop: true,
        autoPlay: true,
      };

      return {
        screenshot,
        currentAnimation: newAnimation,
      };
    }),

  clearScreenshot: () =>
    set({
      screenshot: null,
      currentAnimation: null,
      selectedKeyframeId: null,
    }),

  selectDevice: (device: Device) =>
    set({
      selectedDevice: device,
    }),

  selectTemplate: (template: AnimationTemplate) =>
    set((state) => {
      // Create new animation from template
      const newAnimation: Animation = {
        id: uuidv4(),
        templateId: template.id,
        name: template.displayName,
        duration: template.defaultDuration,
        keyframes: template.defaultKeyframes.map((kf) => ({
          ...kf,
          id: uuidv4(),
        })),
        loop: true,
        autoPlay: true,
      };

      return {
        selectedTemplate: template,
        currentAnimation: state.screenshot ? newAnimation : null,
      };
    }),

  updateKeyframe: (keyframeId: string, updates: Partial<Keyframe>) =>
    set((state) => {
      if (!state.currentAnimation) return state;

      return {
        currentAnimation: {
          ...state.currentAnimation,
          keyframes: state.currentAnimation.keyframes.map((kf) =>
            kf.id === keyframeId ? { ...kf, ...updates } : kf
          ),
        },
      };
    }),

  addKeyframe: (time: number) =>
    set((state) => {
      if (!state.currentAnimation) return state;

      const newKeyframe: Keyframe = {
        id: uuidv4(),
        time: Math.min(time, state.currentAnimation.duration),
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        opacity: 1,
        easing: 'easeInOut',
      };

      const updatedKeyframes = [
        ...state.currentAnimation.keyframes,
        newKeyframe,
      ].sort((a, b) => a.time - b.time);

      return {
        currentAnimation: {
          ...state.currentAnimation,
          keyframes: updatedKeyframes,
        },
        selectedKeyframeId: newKeyframe.id,
      };
    }),

  deleteKeyframe: (keyframeId: string) =>
    set((state) => {
      if (!state.currentAnimation) return state;

      const filteredKeyframes = state.currentAnimation.keyframes.filter(
        (kf) => kf.id !== keyframeId
      );

      return {
        currentAnimation: {
          ...state.currentAnimation,
          keyframes: filteredKeyframes,
        },
        selectedKeyframeId: null,
      };
    }),

  duplicateKeyframe: (keyframeId: string) =>
    set((state) => {
      if (!state.currentAnimation) return state;

      const keyframeToDuplicate = state.currentAnimation.keyframes.find(
        (kf) => kf.id === keyframeId
      );

      if (!keyframeToDuplicate) return state;

      const newKeyframe: Keyframe = {
        ...keyframeToDuplicate,
        id: uuidv4(),
        time: keyframeToDuplicate.time + 100, // Offset by 100ms
      };

      const updatedKeyframes = [
        ...state.currentAnimation.keyframes,
        newKeyframe,
      ].sort((a, b) => a.time - b.time);

      return {
        currentAnimation: {
          ...state.currentAnimation,
          keyframes: updatedKeyframes,
        },
        selectedKeyframeId: newKeyframe.id,
      };
    }),

  updateExportSettings: (settings: Partial<ExportSettings>) =>
    set((state) => ({
      exportSettings: {
        ...state.exportSettings,
        ...settings,
      },
    })),

  setPreviewPlaying: (playing: boolean) =>
    set({
      isPreviewPlaying: playing,
    }),

  setPreviewProgress: (progress: number) =>
    set({
      previewProgress: Math.max(0, Math.min(1, progress)),
    }),

  selectKeyframe: (keyframeId: string | null) =>
    set({
      selectedKeyframeId: keyframeId,
    }),

  resetAnimation: () =>
    set((state) => {
      if (!state.selectedTemplate || !state.screenshot) {
        return {
          currentAnimation: null,
        };
      }

      const newAnimation: Animation = {
        id: uuidv4(),
        templateId: state.selectedTemplate.id,
        name: state.selectedTemplate.displayName,
        duration: state.selectedTemplate.defaultDuration,
        keyframes: state.selectedTemplate.defaultKeyframes.map((kf) => ({
          ...kf,
          id: uuidv4(),
        })),
        loop: true,
        autoPlay: true,
      };

      return {
        currentAnimation: newAnimation,
        selectedKeyframeId: null,
        isPreviewPlaying: false,
        previewProgress: 0,
      };
    }),
}));
