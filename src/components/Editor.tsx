import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { useEditorStore } from '../store/useEditorStore';
import { isWebGLSupported } from '../lib/validation';
import { Preview3D } from './Preview3D';
import { PanelLeft } from './PanelLeft';
import { PanelRight } from './PanelRight';
import { ExportPanel } from './ExportPanel';
import { Settings2, Eye, Sparkles, Download } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Editor() {
  const selectedDevice = useEditorStore((s) => s.selectedDevice);
  const [activePanel, setActivePanel] = useState('center');
  const [isMobile, setIsMobile] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (!isWebGLSupported()) {
      alert('WebGL not supported. Please use a modern browser.');
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1440);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-950 overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32" fill="none" className="flex-shrink-0">
            <rect x="8" y="3" width="16" height="26" rx="3.5" stroke="url(#logo-grad1)" strokeWidth="2" fill="none"/>
            <rect x="10" y="6" width="12" height="18" rx="1" fill="url(#logo-grad2)" opacity="0.15"/>
            <path d="M14 12 L20 16 L14 20 L15.5 16 Z" fill="url(#logo-grad1)"/>
            <rect x="14" y="26" width="4" height="1" rx="0.5" fill="url(#logo-grad1)" opacity="0.6"/>
            <defs>
              <linearGradient id="logo-grad1" x1="8" y1="3" x2="24" y2="29">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
              <linearGradient id="logo-grad2" x1="10" y1="6" x2="22" y2="24">
                <stop offset="0%" stopColor="#7c3aed"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
          </svg>
          <h1 className="text-sm font-semibold text-gray-100 tracking-tight">Mockup Animator</h1>
        </div>
        <div className="flex gap-3 flex-shrink-0 items-center">
          <ThemeToggle />
          <Button
            onClick={() => setExportOpen(true)}
            size="sm"
            className="text-xs bg-gray-800 border border-gray-700 text-gray-200 hover:bg-gray-700"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar
          </Button>
        </div>
      </header>

      {/* Mobile/Tablet Panel Tabs */}
      {isMobile && (
        <div className="border-b border-gray-800 bg-gray-950 px-2 py-1.5">
          <Tabs value={activePanel} onValueChange={setActivePanel}>
            <TabsList className="w-full bg-gray-900 border border-gray-800">
              <TabsTrigger value="left" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100">
                <Settings2 className="w-3.5 h-3.5" />
                Config
              </TabsTrigger>
              <TabsTrigger value="center" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100">
                <Eye className="w-3.5 h-3.5" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="right" className="flex-1 gap-1.5 text-xs data-[state=active]:bg-gray-800 data-[state=active]:text-gray-100">
                <Sparkles className="w-3.5 h-3.5" />
                Effects
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* Left Panel */}
        <div
          className={`transition-all duration-200 overflow-y-auto ${
            isMobile
              ? activePanel === 'left'
                ? 'w-full'
                : 'hidden'
              : 'w-96'
          }`}
        >
          <PanelLeft className="overflow-y-auto" />
        </div>

        {/* Center Panel */}
        <div
          className={`flex-1 min-w-0 transition-all duration-200 bg-gray-900 ${
            isMobile
              ? activePanel === 'center'
                ? 'block'
                : 'hidden'
              : 'block'
          }`}
        >
          {selectedDevice ? (
            <Preview3D />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-gray-500 text-sm px-4 text-center">
                Selecione um dispositivo para visualizar
              </p>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div
          className={`transition-all duration-200 overflow-y-auto ${
            isMobile
              ? activePanel === 'right'
                ? 'w-full'
                : 'hidden'
              : 'w-96'
          }`}
        >
          <PanelRight className="overflow-y-auto" />
        </div>
      </div>

      <ExportPanel open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
