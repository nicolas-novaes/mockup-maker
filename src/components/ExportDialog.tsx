import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useEditorStore } from '../store/useEditorStore';
import { useFFmpeg } from '../hooks/useFFmpeg';
import { exportToMP4, exportToGIF, exportToPNG } from '../lib/exportPipeline';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { ffmpeg, loaded: ffmpegLoaded, error: ffmpegError } = useFFmpeg();
  const currentAnimation = useEditorStore((s) => s.currentAnimation);
  const screenshot = useEditorStore((s) => s.screenshot);

  const [format, setFormat] = useState<'mp4' | 'gif' | 'png'>('mp4');
  const [fps, setFps] = useState('30');
  const [quality, setQuality] = useState<'hd' | '4k'>('hd');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!currentAnimation || !screenshot) {
      setExportError('Missing animation or screenshot');
      return;
    }

    if (format === 'mp4' && !ffmpegLoaded) {
      setExportError('FFmpeg is not ready. Please wait for it to load.');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportProgress(0);

    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        throw new Error('Canvas not found for export');
      }

      let blob: Blob;

      if (format === 'mp4') {
        blob = await exportToMP4(
          canvas,
          currentAnimation,
          parseInt(fps),
          quality,
          setExportProgress
        );
      } else if (format === 'gif') {
        blob = await exportToGIF(canvas, currentAnimation, parseInt(fps));
        setExportProgress(100);
      } else {
        blob = await exportToPNG(canvas, currentAnimation);
        setExportProgress(100);
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `animation.${format === 'mp4' ? 'mp4' : format === 'gif' ? 'gif' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportProgress(100);
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancel = () => {
    if (!isExporting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Export Animation</DialogTitle>
          <DialogDescription>
            Configure export settings and download your animation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Format selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Format</label>
            <div className="flex gap-2">
              {(['mp4', 'gif', 'png'] as const).map((fmt) => (
                <Button
                  key={fmt}
                  variant={format === fmt ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormat(fmt)}
                  disabled={isExporting}
                  className="flex-1"
                >
                  {fmt.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* FPS selector - only for video formats */}
          {format !== 'png' && (
            <div className="space-y-2">
              <label htmlFor="fps" className="text-sm font-medium">
                Frame Rate
              </label>
              <Select value={fps} onValueChange={setFps} disabled={isExporting}>
                <SelectTrigger id="fps">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 FPS</SelectItem>
                  <SelectItem value="30">30 FPS</SelectItem>
                  <SelectItem value="60">60 FPS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quality selector - only for MP4 */}
          {format === 'mp4' && (
            <div className="space-y-2">
              <label htmlFor="quality" className="text-sm font-medium">
                Quality
              </label>
              <Select
                value={quality}
                onValueChange={(v) => setQuality(v as 'hd' | '4k')}
                disabled={isExporting}
              >
                <SelectTrigger id="quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hd">HD (1080p)</SelectItem>
                  <SelectItem value="4k">4K (2160p)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Progress bar */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Exporting...</span>
                <span className="font-medium">{Math.round(exportProgress)}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* FFmpeg status */}
          {format === 'mp4' && (
            <div className="text-xs text-gray-400">
              {ffmpegLoaded ? (
                <span className="text-green-500">FFmpeg ready</span>
              ) : ffmpegError ? (
                <span className="text-red-500">FFmpeg error: {ffmpegError}</span>
              ) : (
                <span>Loading FFmpeg...</span>
              )}
            </div>
          )}

          {/* Error display */}
          {exportError && (
            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
              {exportError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              isExporting || (format === 'mp4' && !ffmpegLoaded)
            }
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
