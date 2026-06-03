import React, { useCallback, useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import {
  Rotate3D,
  ChevronRight,
  Eye,
  Zap,
  Cloud,
  Wind,
  ChevronLeft,
  RotateCw,
  Sun,
  Square,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  Move3D,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Diamond,
  Gem,
  Box,
} from 'lucide-react';

interface CameraPreset {
  id: string;
  label: string;
  icon: React.ReactNode;
  cameraAlpha: number;
  cameraBeta: number;
  modelRotationX: number;
  modelRotationY: number;
  modelRotationZ: number;
}

interface PanelRightProps {
  className?: string;
}

// Consistent icon size: 4x4 (16px) - standard size for UI controls
const ICON_SIZE = 'h-4 w-4';

const CAMERA_PRESETS: CameraPreset[] = [
  { id: 'front', label: 'Frontal', icon: <Square className={ICON_SIZE} />, cameraAlpha: 0, cameraBeta: 0, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'three-quarter-right', label: '3/4 Direita', icon: <ArrowUpRight className={ICON_SIZE} />, cameraAlpha: -0.6, cameraBeta: 0.2, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'three-quarter-left', label: '3/4 Esquerda', icon: <ArrowDownRight className={ICON_SIZE} />, cameraAlpha: 0.6, cameraBeta: 0.2, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'side-right', label: 'Lateral Dir.', icon: <ChevronRight className={ICON_SIZE} />, cameraAlpha: -1.2, cameraBeta: 0, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'side-left', label: 'Lateral Esq.', icon: <ChevronLeft className={ICON_SIZE} />, cameraAlpha: 1.2, cameraBeta: 0, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'top-down', label: 'Topo', icon: <Maximize2 className={ICON_SIZE} />, cameraAlpha: 0, cameraBeta: 1.0, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'bottom-up', label: 'Base', icon: <Layers className={ICON_SIZE} />, cameraAlpha: 0, cameraBeta: -0.6, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'isometric', label: 'Isométrico', icon: <Box className={ICON_SIZE} />, cameraAlpha: -0.78, cameraBeta: 0.55, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'hero-tilt', label: 'Hero Tilt', icon: <Diamond className={ICON_SIZE} />, cameraAlpha: -0.3, cameraBeta: 0.15, modelRotationX: 0.1, modelRotationY: -0.2, modelRotationZ: 0.05 },
  { id: 'showcase', label: 'Showcase', icon: <Gem className={ICON_SIZE} />, cameraAlpha: -0.45, cameraBeta: 0.3, modelRotationX: -0.1, modelRotationY: 0.15, modelRotationZ: -0.05 },
  { id: 'dramatic', label: 'Dramático', icon: <Zap className={ICON_SIZE} />, cameraAlpha: -0.9, cameraBeta: 0.4, modelRotationX: 0, modelRotationY: 0.1, modelRotationZ: 0.1 },
  { id: 'floating', label: 'Flutuante', icon: <Cloud className={ICON_SIZE} />, cameraAlpha: 0.2, cameraBeta: -0.3, modelRotationX: 0.15, modelRotationY: 0.1, modelRotationZ: -0.08 },
  { id: 'tilted-right', label: 'Inclinado Dir.', icon: <RotateCw className={ICON_SIZE} />, cameraAlpha: 0, cameraBeta: 0, modelRotationX: 0, modelRotationY: 0, modelRotationZ: -0.3 },
  { id: 'tilted-left', label: 'Inclinado Esq.', icon: <RotateCcw className={ICON_SIZE} />, cameraAlpha: 0, cameraBeta: 0, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0.3 },
  { id: 'perspective-top', label: 'Perspectiva', icon: <Move3D className={ICON_SIZE} />, cameraAlpha: -0.5, cameraBeta: 0.7, modelRotationX: 0, modelRotationY: 0.3, modelRotationZ: 0 },
  { id: 'flat-lay', label: 'Flat Lay', icon: <FlipVertical className={ICON_SIZE} />, cameraAlpha: 0, cameraBeta: 1.25, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'editorial', label: 'Editorial', icon: <FlipHorizontal className={ICON_SIZE} />, cameraAlpha: -0.35, cameraBeta: 0.1, modelRotationX: 0, modelRotationY: -0.3, modelRotationZ: 0.15 },
  { id: 'back', label: 'Traseira', icon: <Rotate3D className={ICON_SIZE} />, cameraAlpha: Math.PI, cameraBeta: 0, modelRotationX: 0, modelRotationY: 0, modelRotationZ: 0 },
  { id: 'cinematic', label: 'Cinemático', icon: <Eye className={ICON_SIZE} />, cameraAlpha: -0.15, cameraBeta: 0.05, modelRotationX: 0.05, modelRotationY: -0.4, modelRotationZ: 0.1 },
  { id: 'dynamic', label: 'Dinâmico', icon: <Wind className={ICON_SIZE} />, cameraAlpha: 0.7, cameraBeta: -0.2, modelRotationX: -0.15, modelRotationY: 0.25, modelRotationZ: -0.12 },
];

function LightSphere({ azimuth, elevation, onChange }: {
  azimuth: number;
  elevation: number;
  onChange: (azimuth: number, elevation: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Convert azimuth/elevation to dot position (x, y relative to center, normalized -1 to 1)
  const azimuthRad = (azimuth * Math.PI) / 180;
  const distance = 1 - elevation / 90; // 0 at center (90°), 1 at edge (0°)
  const dotX = Math.cos(azimuthRad) * distance;
  const dotY = -Math.sin(azimuthRad) * distance;

  const updateFromPosition = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = rect.width / 2;

    let dx = (clientX - cx) / radius;
    let dy = (clientY - cy) / radius;

    // Clamp to circle
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) { dx /= dist; dy /= dist; }

    const newAzimuth = ((Math.atan2(-dy, dx) * 180) / Math.PI + 360) % 360;
    const newElevation = Math.round((1 - Math.min(dist, 1)) * 90);
    onChange(Math.round(newAzimuth), newElevation);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPosition(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateFromPosition(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Highlight gradient position (follows the dot)
  const highlightX = ((dotX + 1) / 2) * 100;
  const highlightY = ((dotY + 1) / 2) * 100;

  return (
    <div
      ref={containerRef}
      className="w-28 h-28 mx-auto rounded-full relative cursor-pointer select-none touch-none"
      style={{
        background: `radial-gradient(circle at ${highlightX}% ${highlightY}%, rgba(255,255,255,0.25) 0%, rgba(30,30,30,1) 60%, rgba(10,10,10,1) 100%)`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Light dot */}
      <div
        className="absolute w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)] border border-amber-300"
        style={{
          left: `calc(50% + ${dotX * 50}% - 6px)`,
          top: `calc(50% + ${dotY * 50}% - 6px)`,
        }}
      />
    </div>
  );
}

export function PanelRight({ className }: PanelRightProps) {
  const lightConfig = useEditorStore((state) => state.lightConfig);
  const setLightConfig = useEditorStore((state) => state.setLightConfig);
  const renderEngine = useEditorStore((state) => state.renderEngine);
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(null);

  const handlePresetSelect = useCallback(
    (preset: CameraPreset) => {
      if (!renderEngine) return;
      setSelectedPreset(preset.id);
      renderEngine.applyPreset(preset);
    },
    [renderEngine]
  );

  return (
    <Card className={`bg-gray-950 rounded-none p-4 h-full flex flex-col w-full ${className || ''}`}>
      {/* Lighting Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-widest flex items-center gap-2">
          <Sun className="h-3.5 w-3.5" />
          Lighting
        </h3>
        <LightSphere
          azimuth={lightConfig.azimuth}
          elevation={lightConfig.elevation}
          onChange={(az, el) => setLightConfig({ azimuth: az, elevation: el })}
        />
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Azimuth</span>
              <span className="text-xs font-mono text-gray-500">{lightConfig.azimuth}°</span>
            </div>
            <Slider
              value={[lightConfig.azimuth]}
              onValueChange={([v]) => setLightConfig({ azimuth: v })}
              min={0}
              max={360}
              step={1}
              className="[&_[data-slot=slider-track]]:bg-gray-800 [&_[data-slot=slider-range]]:bg-gray-500 [&_[data-slot=slider-thumb]]:bg-gray-300 [&_[data-slot=slider-thumb]]:border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Elevation</span>
              <span className="text-xs font-mono text-gray-500">{lightConfig.elevation}°</span>
            </div>
            <Slider
              value={[lightConfig.elevation]}
              onValueChange={([v]) => setLightConfig({ elevation: v })}
              min={0}
              max={90}
              step={1}
              className="[&_[data-slot=slider-track]]:bg-gray-800 [&_[data-slot=slider-range]]:bg-gray-500 [&_[data-slot=slider-thumb]]:bg-gray-300 [&_[data-slot=slider-thumb]]:border-gray-600"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Intensity</span>
              <span className="text-xs font-mono text-gray-500">{lightConfig.intensity.toFixed(1)}</span>
            </div>
            <Slider
              value={[lightConfig.intensity]}
              onValueChange={([v]) => setLightConfig({ intensity: v })}
              min={0.5}
              max={3}
              step={0.1}
              className="[&_[data-slot=slider-track]]:bg-gray-800 [&_[data-slot=slider-range]]:bg-gray-500 [&_[data-slot=slider-thumb]]:bg-gray-300 [&_[data-slot=slider-thumb]]:border-gray-600"
            />
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">Shadow</span>
            <button
              onClick={() => setLightConfig({ shadowEnabled: !lightConfig.shadowEnabled })}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                lightConfig.shadowEnabled ? 'bg-gray-500' : 'bg-gray-800'
              }`}
            >
              <span
                className={`absolute top-[3px] w-3.5 h-3.5 rounded-full bg-gray-200 transition-all ${
                  lightConfig.shadowEnabled ? 'left-[calc(100%-17px)]' : 'left-[3px]'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <Separator className="my-4 bg-gray-800" />

      {/* Camera Presets Grid Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Presets</h3>
        <div className="rounded-lg border border-gray-800 bg-gray-900">
          <div className="grid grid-cols-4 gap-4 p-4">
            {CAMERA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                aria-label={`Select ${preset.label} preset`}
                className={`h-20 rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-all text-xs font-medium border focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:outline-none ${
                  selectedPreset === preset.id
                    ? 'ring-2 ring-gray-500 border-gray-600 bg-gray-700 text-gray-100'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <div className="transition-colors">
                  {preset.icon}
                </div>
                <span className="text-center leading-tight">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
