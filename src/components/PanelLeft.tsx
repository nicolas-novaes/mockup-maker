import React, { useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { Card } from './ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import { Separator } from './ui/separator';
import { DeviceSelector } from './DeviceSelector';
import { ImageUploadPanel } from './ImageUploadPanel';
import type { BackgroundConfig } from '../lib/types';
import {
  ChevronDown,
  Palette,
  Blend,
  ImageIcon,
  Grid3X3,
  Upload,
} from 'lucide-react';

interface PanelLeftProps {
  className?: string;
}

export function PanelLeft({ className }: PanelLeftProps) {
  const backgroundConfig = useEditorStore((state) => state.backgroundConfig);
  const setBackgroundConfig = useEditorStore((state) => state.setBackgroundConfig);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className={`bg-gray-950 rounded-none p-4 h-full flex flex-col w-full ${className || ''}`}>
      {/* Image Upload Section */}
      <div className="space-y-4">
        <ImageUploadPanel />
      </div>

      <Separator className="my-4 bg-gray-800" />

      {/* Device Selector Section */}
      <div className="space-y-4">
        <DeviceSelector />
      </div>

      <Separator className="my-4 bg-gray-800" />

      {/* Background Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Background</h3>

        {/* Type selector */}
        <div className="grid grid-cols-4 gap-2">
          {([
            { type: 'solid', icon: <Palette className="w-3.5 h-3.5" />, label: 'Cor' },
            { type: 'gradient', icon: <Blend className="w-3.5 h-3.5" />, label: 'Degradê' },
            { type: 'image', icon: <ImageIcon className="w-3.5 h-3.5" />, label: 'Imagem' },
            { type: 'transparent', icon: <Grid3X3 className="w-3.5 h-3.5" />, label: 'Transp.' },
          ] as const).map((opt) => (
            <button
              key={opt.type}
              onClick={() => {
                if (opt.type === 'solid') setBackgroundConfig({ type: 'solid', color: backgroundConfig.type === 'solid' ? backgroundConfig.color : '#111111' });
                else if (opt.type === 'gradient') setBackgroundConfig({ type: 'gradient', gradientType: 'linear', colorStart: '#1a1a2e', colorEnd: '#16213e', angle: 180, centerX: 0.5, centerY: 0.5 });
                else if (opt.type === 'image') bgImageInputRef.current?.click();
                else setBackgroundConfig({ type: 'transparent' });
              }}
              className={`flex flex-col items-center gap-1 p-2 rounded-md border text-xs transition-colors ${
                backgroundConfig.type === opt.type
                  ? 'border-gray-500 bg-gray-800 text-gray-200'
                  : 'border-gray-800 bg-gray-900 text-gray-500 hover:border-gray-700 hover:text-gray-400'
              }`}
            >
              {opt.icon}
              <span className="text-[10px]">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Contextual controls */}
        {backgroundConfig.type === 'solid' && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={backgroundConfig.color}
              onChange={(e) => setBackgroundConfig({ type: 'solid', color: e.target.value })}
              className="w-8 h-8 rounded border border-gray-700 bg-transparent cursor-pointer [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch-wrapper]:p-0.5"
            />
            <input
              type="text"
              value={backgroundConfig.color}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                  setBackgroundConfig({ type: 'solid', color: v });
                }
              }}
              onBlur={(e) => {
                const v = e.target.value;
                if (!/^#[0-9a-fA-F]{6}$/.test(v)) {
                  setBackgroundConfig({ type: 'solid', color: '#08080c' });
                }
              }}
              className="flex-1 h-8 px-2 text-xs font-mono bg-gray-800 border border-gray-700 rounded-md text-gray-300 focus:outline-none focus:border-gray-500"
            />
          </div>
        )}

        {backgroundConfig.type === 'gradient' && (
          <div className="space-y-3">
            {/* Linear / Radial toggle */}
            <div className="flex rounded-md border border-gray-700 overflow-hidden">
              <button
                onClick={() => setBackgroundConfig({ ...backgroundConfig, gradientType: 'linear' })}
                className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${
                  backgroundConfig.gradientType === 'linear'
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-900 text-gray-500 hover:text-gray-400'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setBackgroundConfig({ ...backgroundConfig, gradientType: 'radial' })}
                className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${
                  backgroundConfig.gradientType === 'radial'
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-gray-900 text-gray-500 hover:text-gray-400'
                }`}
              >
                Radial
              </button>
            </div>

            {/* Color inputs */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundConfig.colorStart}
                onChange={(e) => setBackgroundConfig({ ...backgroundConfig, colorStart: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 bg-transparent cursor-pointer [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch-wrapper]:p-0.5"
              />
              <input
                type="text"
                value={backgroundConfig.colorStart}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                    setBackgroundConfig({ ...backgroundConfig, colorStart: v });
                  }
                }}
                onBlur={(e) => {
                  if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    setBackgroundConfig({ ...backgroundConfig, colorStart: '#1a1a2e' });
                  }
                }}
                className="flex-1 h-7 px-2 text-[10px] font-mono bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={backgroundConfig.colorEnd}
                onChange={(e) => setBackgroundConfig({ ...backgroundConfig, colorEnd: e.target.value })}
                className="w-7 h-7 rounded border border-gray-700 bg-transparent cursor-pointer [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch-wrapper]:p-0.5"
              />
              <input
                type="text"
                value={backgroundConfig.colorEnd}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                    setBackgroundConfig({ ...backgroundConfig, colorEnd: v });
                  }
                }}
                onBlur={(e) => {
                  if (!/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                    setBackgroundConfig({ ...backgroundConfig, colorEnd: '#16213e' });
                  }
                }}
                className="flex-1 h-7 px-2 text-[10px] font-mono bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Angle/Position Pad */}
            <div
              className="relative w-full h-24 rounded-md border border-gray-700 cursor-crosshair overflow-hidden select-none"
              style={{
                background: backgroundConfig.gradientType === 'radial'
                  ? `radial-gradient(circle at ${backgroundConfig.centerX * 100}% ${backgroundConfig.centerY * 100}%, ${backgroundConfig.colorStart}, ${backgroundConfig.colorEnd})`
                  : `linear-gradient(${backgroundConfig.angle}deg, ${backgroundConfig.colorStart}, ${backgroundConfig.colorEnd})`,
              }}
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const update = (ev: MouseEvent) => {
                  const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                  const y = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));
                  if (backgroundConfig.gradientType === 'radial') {
                    setBackgroundConfig({ ...backgroundConfig, centerX: x, centerY: y });
                  } else {
                    const angle = Math.round(
                      ((Math.atan2(x - 0.5, -(y - 0.5)) * 180) / Math.PI + 360) % 360
                    );
                    setBackgroundConfig({ ...backgroundConfig, angle });
                  }
                };
                update(e.nativeEvent);
                const onMove = (ev: MouseEvent) => update(ev);
                const onUp = () => {
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
            >
              {/* Dot indicator */}
              <div
                className="absolute w-3 h-3 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                  left: `${(backgroundConfig.gradientType === 'radial'
                    ? backgroundConfig.centerX
                    : 0.5 + Math.sin((backgroundConfig.angle * Math.PI) / 180) * 0.4
                  ) * 100}%`,
                  top: `${(backgroundConfig.gradientType === 'radial'
                    ? backgroundConfig.centerY
                    : 0.5 - Math.cos((backgroundConfig.angle * Math.PI) / 180) * 0.4
                  ) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
            <div className="text-[10px] text-gray-500 text-center">
              {backgroundConfig.gradientType === 'linear'
                ? `Ângulo: ${backgroundConfig.angle}°`
                : `Centro: ${Math.round(backgroundConfig.centerX * 100)}%, ${Math.round(backgroundConfig.centerY * 100)}%`}
            </div>
          </div>
        )}

        {backgroundConfig.type === 'image' && (
          <div className="space-y-2">
            <div className="aspect-video rounded-md border border-gray-700 bg-gray-900 overflow-hidden relative">
              <img src={backgroundConfig.dataURL} alt="Background" className="w-full h-full object-cover" />
              <button
                onClick={() => bgImageInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
              >
                <Upload className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
        )}

        {backgroundConfig.type === 'transparent' && (
          <div className="h-10 rounded-md border border-gray-700 overflow-hidden" style={{
            backgroundImage: 'linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)',
            backgroundSize: '12px 12px',
            backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
            backgroundColor: '#1a1a1a',
          }} />
        )}

        {/* Hidden file input for background image */}
        <input
          ref={bgImageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              const dataURL = ev.target?.result as string;
              setBackgroundConfig({ type: 'image', dataURL });
            };
            reader.readAsDataURL(file);
            e.target.value = '';
          }}
          className="hidden"
        />
      </div>

    </Card>
  );
}
