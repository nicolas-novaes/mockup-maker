import { useEffect, useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { RenderEngine, type DeviceTransform } from '../lib/renderEngine';
import { interpolateKeyframes } from '../lib/keyframes';

export function Preview3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderEngineRef = useRef<RenderEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const screenshot = useEditorStore((state) => state.screenshot);
  const currentAnimation = useEditorStore((state) => state.currentAnimation);
  const isPreviewPlaying = useEditorStore((state) => state.isPreviewPlaying);
  const previewProgress = useEditorStore((state) => state.previewProgress);
  const setPreviewProgress = useEditorStore((state) => state.setPreviewProgress);

  // Initialize render engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new RenderEngine(canvasRef.current, {
      width: canvasRef.current.clientWidth,
      height: canvasRef.current.clientHeight,
    });

    renderEngineRef.current = engine;

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current && renderEngineRef.current) {
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        renderEngineRef.current.resize(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, []);

  // Load screenshot texture
  useEffect(() => {
    if (!screenshot || !renderEngineRef.current) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        renderEngineRef.current?.loadScreenshot(canvas);
      }
    };
    img.src = screenshot.data;
  }, [screenshot]);

  // Animation loop
  useEffect(() => {
    if (!currentAnimation || !renderEngineRef.current) return;

    const animate = (timestamp: number) => {
      if (!isPreviewPlaying && previewProgress === 0) {
        startTimeRef.current = timestamp;
      }

      let currentTime: number;

      if (isPreviewPlaying) {
        if (startTimeRef.current === 0) {
          startTimeRef.current = timestamp;
        }

        currentTime = timestamp - startTimeRef.current;

        // Handle loop
        if (currentAnimation.loop && currentTime >= currentAnimation.duration) {
          currentTime = currentTime % currentAnimation.duration;
          startTimeRef.current = timestamp - currentTime;
        }

        // Stop at end if not looping
        if (!currentAnimation.loop && currentTime >= currentAnimation.duration) {
          currentTime = currentAnimation.duration;
        }

        setPreviewProgress(currentTime / currentAnimation.duration);
      } else {
        currentTime = previewProgress * currentAnimation.duration;
      }

      // Interpolate keyframes
      const keyframeData = interpolateKeyframes(
        currentAnimation.keyframes,
        currentTime,
        currentAnimation.duration
      );

      // Create transform from keyframe data
      const transform: DeviceTransform = {
        position: keyframeData.position || { x: 0, y: 0, z: 0 },
        rotation: keyframeData.rotation || { x: 0, y: 0, z: 0 },
        scale: keyframeData.scale || { x: 1, y: 1, z: 1 },
        opacity: keyframeData.opacity ?? 1,
      };

      renderEngineRef.current?.setDeviceTransform(transform);
      renderEngineRef.current?.render();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPreviewPlaying, previewProgress, currentAnimation, setPreviewProgress]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      {currentAnimation && screenshot ? (
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.828 14.828a4 4 0 01-5.656 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-center">
            {!screenshot ? 'Upload a screenshot to start' : 'Select an animation template'}
          </p>
        </div>
      )}
    </div>
  );
}
