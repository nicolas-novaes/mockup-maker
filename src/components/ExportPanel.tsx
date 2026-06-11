import { useState, useEffect, useRef } from 'react';
import { X, Download, Image, FileImage } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

interface ExportPanelProps {
  open: boolean;
  onClose: () => void;
}

type Format = 'png' | 'jpeg';

const EXPORT_WIDTH = 3840;
const EXPORT_HEIGHT = 2160;

export function ExportPanel({ open, onClose }: ExportPanelProps) {
  const renderEngine = useEditorStore((s) => s.renderEngine);
  const backgroundConfig = useEditorStore((s) => s.backgroundConfig);
  const [format, setFormat] = useState<Format>('png');
  const [transparent, setTransparent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync transparent default with background config
  useEffect(() => {
    setTransparent(backgroundConfig.type === 'transparent');
  }, [backgroundConfig]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay to avoid capturing the opening click
    const timeout = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 100);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleExport = () => {
    if (!renderEngine) return;
    setIsExporting(true);

    // Use setTimeout to allow UI to update before heavy render
    setTimeout(() => {
      const useTransparent = format === 'png' && transparent;
      const dataURL = renderEngine.exportImage(EXPORT_WIDTH, EXPORT_HEIGHT, format, useTransparent);

      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `mockup-4k-${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setIsExporting(false);
    }, 50);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-80 bg-gray-950 border-l border-gray-800 z-50 flex flex-col transition-transform duration-250 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-100">Exportar</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Format */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Formato</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('png')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  format === 'png'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <Image className="w-4 h-4" />
                PNG
              </button>
              <button
                onClick={() => setFormat('jpeg')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  format === 'jpeg'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <FileImage className="w-4 h-4" />
                JPG
              </button>
            </div>
          </div>

          {/* Transparent background - only for PNG */}
          {format === 'png' && (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Fundo</label>
              <button
                onClick={() => setTransparent(!transparent)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                  transparent
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <span>Fundo transparente</span>
                <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                  transparent ? 'bg-blue-500 border-blue-500' : 'border-gray-600'
                }`}>
                  {transparent && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Summary */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Resumo</label>
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Formato</span>
                <span className="text-gray-200 font-medium">{format.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Resolução</span>
                <span className="text-gray-200 font-medium">4K</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Dimensões</span>
                <span className="text-gray-200 font-mono">3840×2160px</span>
              </div>
              {format === 'png' && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Fundo</span>
                  <span className="text-gray-200 font-medium">{transparent ? 'Transparente (recortado)' : 'Com fundo'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-800">
          <button
            onClick={handleExport}
            disabled={isExporting || !renderEngine}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exportando...' : 'Exportar imagem'}
          </button>
        </div>
      </div>
    </>
  );
}
