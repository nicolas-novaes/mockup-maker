import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useEditorStore } from '../store/useEditorStore';
import { isWebGLSupported } from '../lib/validation';
import { Preview3D } from './Preview3D';
import { DeviceSelector } from './DeviceSelector';
import { TemplateSelector } from './TemplateSelector';
import { AnimationTimeline } from './AnimationTimeline';
import { ExportDialog } from './ExportDialog';

export function Editor() {
  const navigate = useNavigate();
  const screenshot = useEditorStore((s) => s.screenshot);
  const selectedDevice = useEditorStore((s) => s.selectedDevice);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (!screenshot) {
      navigate('/');
    }
    if (!isWebGLSupported()) {
      alert('WebGL not supported. Please use a modern browser.');
    }
  }, [screenshot, navigate]);

  if (!screenshot) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Mockup Animator</h1>
          <p className="text-xs text-gray-400">{screenshot.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/')}>
            ← New
          </Button>
          <Button onClick={() => setExportOpen(true)}>Export</Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Left panel */}
        <div className="w-80 space-y-4 overflow-y-auto">
          <DeviceSelector />

          {selectedDevice && (
            <>
              <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="mt-4">
                  <TemplateSelector />
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <AnimationTimeline />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>

        {/* Center panel - 3D preview */}
        <div className="flex-1 min-w-0">
          {selectedDevice ? (
            <Preview3D />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-800 rounded-lg">
              <p className="text-gray-400">Select a device to see preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Export dialog */}
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
