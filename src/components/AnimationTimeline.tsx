import { useEditorStore } from '../store/useEditorStore';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { formatDuration } from '../lib/utils-animation';

export function AnimationTimeline() {
  const currentAnimation = useEditorStore((state) => state.currentAnimation);
  const isPreviewPlaying = useEditorStore((state) => state.isPreviewPlaying);
  const previewProgress = useEditorStore((state) => state.previewProgress);
  const selectedKeyframeId = useEditorStore((state) => state.selectedKeyframeId);

  const setPreviewPlaying = useEditorStore((state) => state.setPreviewPlaying);
  const setPreviewProgress = useEditorStore((state) => state.setPreviewProgress);
  const addKeyframe = useEditorStore((state) => state.addKeyframe);
  const deleteKeyframe = useEditorStore((state) => state.deleteKeyframe);
  const selectKeyframe = useEditorStore((state) => state.selectKeyframe);
  const updateKeyframe = useEditorStore((state) => state.updateKeyframe);

  if (!currentAnimation) {
    return (
      <div className="text-center text-slate-400 py-8">
        No animation loaded
      </div>
    );
  }

  const currentTime = previewProgress * currentAnimation.duration;
  const selectedKeyframe = currentAnimation.keyframes.find(
    (kf) => kf.id === selectedKeyframeId
  );

  const handleTimeSliderChange = (value: number[]) => {
    if (isPreviewPlaying) {
      setPreviewPlaying(false);
    }
    setPreviewProgress(value[0] / currentAnimation.duration);
  };

  const handleAddKeyframe = () => {
    addKeyframe(currentTime);
  };

  const handleDeleteKeyframe = (keyframeId: string) => {
    if (currentAnimation.keyframes.length > 1) {
      deleteKeyframe(keyframeId);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-slate-800 rounded-lg p-4">
      {/* Time Display */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Timeline</span>
        <span className="text-sm font-mono text-slate-400">
          {formatDuration(currentTime)} / {formatDuration(currentAnimation.duration)}
        </span>
      </div>

      {/* Time Slider */}
      <div className="flex items-center gap-4">
        <Slider
          value={[currentTime]}
          min={0}
          max={currentAnimation.duration}
          step={10}
          onValueChange={handleTimeSliderChange}
          className="flex-1"
        />
      </div>

      {/* Playback Controls */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={isPreviewPlaying ? 'default' : 'outline'}
          onClick={() => setPreviewPlaying(!isPreviewPlaying)}
          className="flex-1"
        >
          {isPreviewPlaying ? '⏸ Pause' : '▶ Play'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPreviewProgress(0)}
          className="flex-1"
        >
          ⏮ Reset
        </Button>
      </div>

      {/* Keyframes List */}
      <div className="border-t border-slate-700 pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-300">
            Keyframes ({currentAnimation.keyframes.length})
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddKeyframe}
          >
            + Add Keyframe
          </Button>
        </div>

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {currentAnimation.keyframes.map((keyframe, idx) => (
            <div
              key={keyframe.id}
              onClick={() => selectKeyframe(keyframe.id)}
              className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                selectedKeyframeId === keyframe.id
                  ? 'bg-blue-900 bg-opacity-50 border border-blue-500'
                  : 'bg-slate-700 hover:bg-slate-600 border border-slate-600'
              }`}
            >
              <div className="flex-1">
                <span className="text-xs text-slate-400">
                  #{idx + 1} at {formatDuration(keyframe.time)}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteKeyframe(keyframe.id);
                }}
                disabled={currentAnimation.keyframes.length === 1}
                className="text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe Properties Editor */}
      {selectedKeyframe && (
        <div className="border-t border-slate-700 pt-4">
          <span className="text-sm font-medium text-slate-300 block mb-3">
            Keyframe Properties
          </span>

          <div className="space-y-3">
            {/* Rotation */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Rotation (degrees)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">X</span>
                  <Input
                    type="number"
                    step={1}
                    value={selectedKeyframe.rotation?.x || 0}
                    onChange={(e) =>
                      updateKeyframe(selectedKeyframe.id, {
                        rotation: {
                          ...selectedKeyframe.rotation,
                          x: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Y</span>
                  <Input
                    type="number"
                    step={1}
                    value={selectedKeyframe.rotation?.y || 0}
                    onChange={(e) =>
                      updateKeyframe(selectedKeyframe.id, {
                        rotation: {
                          ...selectedKeyframe.rotation,
                          y: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Z</span>
                  <Input
                    type="number"
                    step={1}
                    value={selectedKeyframe.rotation?.z || 0}
                    onChange={(e) =>
                      updateKeyframe(selectedKeyframe.id, {
                        rotation: {
                          ...selectedKeyframe.rotation,
                          z: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 block">Position (pixels)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">X</span>
                  <Input
                    type="number"
                    step={1}
                    value={selectedKeyframe.position?.x || 0}
                    onChange={(e) =>
                      updateKeyframe(selectedKeyframe.id, {
                        position: {
                          ...selectedKeyframe.position,
                          x: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Y</span>
                  <Input
                    type="number"
                    step={1}
                    value={selectedKeyframe.position?.y || 0}
                    onChange={(e) =>
                      updateKeyframe(selectedKeyframe.id, {
                        position: {
                          ...selectedKeyframe.position,
                          y: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Z</span>
                  <Input
                    type="number"
                    step={1}
                    value={selectedKeyframe.position?.z || 0}
                    onChange={(e) =>
                      updateKeyframe(selectedKeyframe.id, {
                        position: {
                          ...selectedKeyframe.position,
                          z: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Opacity ({(selectedKeyframe.opacity ?? 1).toFixed(2)})
              </label>
              <Slider
                value={[(selectedKeyframe.opacity ?? 1) * 100]}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) =>
                  updateKeyframe(selectedKeyframe.id, {
                    opacity: value[0] / 100,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
