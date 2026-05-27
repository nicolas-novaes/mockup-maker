import { useEditorStore } from '../store/useEditorStore';
import { iPhoneDevices } from '../lib/deviceData';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { Device } from '../lib/types';

export function DeviceSelector() {
  const selectedDevice = useEditorStore((state) => state.selectedDevice);
  const selectDevice = useEditorStore((state) => state.selectDevice);

  // Group devices by model generation
  const groupedDevices: Record<string, Device[]> = {};

  iPhoneDevices.forEach((device) => {
    const match = device.id.match(/iphone(\d+)/);
    if (match) {
      const generation = `iPhone ${match[1]}`;
      if (!groupedDevices[generation]) {
        groupedDevices[generation] = [];
      }
      groupedDevices[generation].push(device);
    }
  });

  const handleDeviceSelect = (deviceId: string) => {
    const device = iPhoneDevices.find((d) => d.id === deviceId);
    if (device) {
      selectDevice(device);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="device-select" className="text-sm font-medium text-slate-200">
          Device Model
        </label>
        <Select
          value={selectedDevice?.id || ''}
          onValueChange={handleDeviceSelect}
        >
          <SelectTrigger id="device-select" className="w-full">
            <SelectValue placeholder="Select a device..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedDevices).map(([generation, devices]) => (
              <div key={generation}>
                <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase">
                  {generation}
                </div>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.displayName}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Device Specs */}
      {selectedDevice && (
        <div className="bg-slate-700 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Screen Size</span>
            <span className="text-sm font-mono font-semibold text-white">
              {selectedDevice.width}x{selectedDevice.height}
            </span>
          </div>
          {selectedDevice.notch && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Notch</span>
              <span className="text-sm font-mono font-semibold text-white">
                {selectedDevice.notch.width}x{selectedDevice.notch.height}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Scale</span>
            <span className="text-sm font-mono font-semibold text-white">
              {selectedDevice.scale}x
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Corner Radius</span>
            <span className="text-sm font-mono font-semibold text-white">
              {selectedDevice.cornerRadius}px
            </span>
          </div>
        </div>
      )}

      {!selectedDevice && (
        <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4 text-center text-sm text-slate-400">
          No device selected
        </div>
      )}
    </div>
  );
}
