import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { RenderEngine } from '../lib/renderEngine';

export function Preview3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderEngineRef = useRef<RenderEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const screenshot = useEditorStore((state) => state.screenshot);
  const selectedDevice = useEditorStore((state) => state.selectedDevice);
  const lightConfig = useEditorStore((state) => state.lightConfig);
  const backgroundConfig = useEditorStore((state) => state.backgroundConfig);
  const setRenderEngine = useEditorStore((state) => state.setRenderEngine);

  // Initialize render engine
  useEffect(() => {
    console.log('Preview3D: useEffect called, canvasRef.current:', canvasRef.current);

    if (!canvasRef.current) {
      console.warn('Preview3D: Canvas ref not available yet');
      return;
    }

    try {
      // Set canvas resolution
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;

      console.log('Preview3D: Creating RenderEngine with dimensions:', width, 'x', height);

      const engine = new RenderEngine(canvasRef.current, {
        width: width,
        height: height,
      });

      renderEngineRef.current = engine;
      setRenderEngine(engine);
      console.log('Preview3D: RenderEngine created successfully');

      // Handle resize
      const handleResize = () => {
        if (canvasRef.current && renderEngineRef.current) {
          renderEngineRef.current.resize();
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        setRenderEngine(null);
        engine.dispose();
      };
    } catch (error) {
      console.error('Preview3D: Error initializing RenderEngine:', error);
    }
  }, []);

  // Load device model when selectedDevice changes
  useEffect(() => {
    if (!selectedDevice || !renderEngineRef.current) return;

    let showTimeout: ReturnType<typeof setTimeout> | null = null;
    let loaded = false;

    // Only show loading if model takes more than 1s
    showTimeout = setTimeout(() => {
      if (!loaded) setIsLoading(true);
    }, 1000);

    renderEngineRef.current.loadDevice(selectedDevice).then(() => {
      loaded = true;
      if (showTimeout) clearTimeout(showTimeout);
      setIsLoading(false);
    }).catch(() => {
      loaded = true;
      if (showTimeout) clearTimeout(showTimeout);
      setIsLoading(false);
    });
  }, [selectedDevice]);

  // Reset camera on X key press (reload device)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyX' && selectedDevice && renderEngineRef.current) {
        renderEngineRef.current.loadDevice(selectedDevice);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDevice]);

  // Load/clear screenshot texture
  useEffect(() => {
    if (!renderEngineRef.current) return;

    if (screenshot) {
      console.log('[Preview3D] Loading screenshot image...');
      renderEngineRef.current.loadScreenshotFromDataURL(screenshot.data);
    } else {
      renderEngineRef.current.clearScreenshotTexture();
    }
  }, [screenshot]);

  // Sync light config
  useEffect(() => {
    if (!renderEngineRef.current) return;

    renderEngineRef.current.setLightPosition(lightConfig.azimuth, lightConfig.elevation);
    renderEngineRef.current.setLightIntensity(lightConfig.intensity);
  }, [lightConfig]);

  // Sync background config
  useEffect(() => {
    if (!renderEngineRef.current) return;

    renderEngineRef.current.setBackground(backgroundConfig);
  }, [backgroundConfig]);

  return (
    <div className={`w-full h-full flex flex-col items-center justify-center overflow-hidden relative ${
      backgroundConfig.type === 'transparent'
        ? 'bg-[length:20px_20px] bg-[position:0_0,10px_10px]'
        : 'bg-gray-900'
    }`} style={backgroundConfig.type === 'transparent' ? {
      backgroundImage: 'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    } : undefined}>
      {selectedDevice ? (
        <>
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-200 rounded-full animate-spin" />
                <span className="text-xs text-gray-400">Carregando modelo...</span>
              </div>
            </div>
          )}
          {/* Interaction hint */}
          {!isLoading && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-none flex-nowrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-md">
                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 24" fill="none">
                  <rect x="2" y="1" width="16" height="22" rx="8" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="1" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="2" y="1" width="8" height="11" rx="4" fill="currentColor" opacity="0.5" />
                </svg>
                <span className="text-xs text-gray-400">Rotacionar</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-md">
                <svg className="w-4 h-4 text-gray-300" viewBox="0 0 20 24" fill="none">
                  <rect x="2" y="1" width="16" height="22" rx="8" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="10" y1="1" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="7" y="3" width="6" height="6" rx="3" fill="currentColor" opacity="0.5" />
                </svg>
                <span className="text-xs text-gray-400 whitespace-nowrap">Girar modelo</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-md">
                <kbd className="text-[10px] text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded font-mono">Space</kbd>
                <span className="text-xs text-gray-400">Mover</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 rounded-md">
                <kbd className="text-[10px] text-gray-300 bg-gray-700 px-1.5 py-0.5 rounded font-mono">X</kbd>
                <span className="text-xs text-gray-400">Resetar</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
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
          <p className="text-center text-sm">
            Selecione um dispositivo
          </p>
        </div>
      )}
    </div>
  );
}
