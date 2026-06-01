import { useEditorStore } from '../store/useEditorStore';
import { allDevices } from '../lib/deviceData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from './ui/select';
import type { Device } from '../lib/types';

export function DeviceSelector() {
  const selectedDevice = useEditorStore((state) => state.selectedDevice);
  const selectDevice = useEditorStore((state) => state.selectDevice);

  // Group devices by model generation
  const groupedDevices: Record<string, Device[]> = {};

  allDevices.forEach((device) => {
    const iphoneMatch = device.id.match(/iphone(\d+)/);
    const ipadMatch = device.id.match(/ipad/);
    const macMatch = device.id.match(/macbook/);
    const androidMatch = device.id.match(/galaxy|pixel|android/);
    let group: string;
    if (iphoneMatch) {
      group = `iPhone ${iphoneMatch[1]}`;
    } else if (ipadMatch) {
      group = 'Tablets';
    } else if (macMatch) {
      group = 'MacBooks';
    } else if (androidMatch) {
      group = 'Android';
    } else {
      group = 'Other';
    }
    if (!groupedDevices[group]) {
      groupedDevices[group] = [];
    }
    groupedDevices[group].push(device);
  });

  const handleDeviceSelect = (deviceId: string) => {
    const device = allDevices.find((d) => d.id === deviceId);
    if (device) {
      selectDevice(device);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="device-select" className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Device
        </label>
        <Select
          value={selectedDevice?.id || ''}
          onValueChange={handleDeviceSelect}
        >
          <SelectTrigger id="device-select" className="w-full bg-gray-900 border-gray-700 text-gray-300">
            <span className="truncate">
              {selectedDevice?.displayName || 'Select device...'}
            </span>
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {Object.entries(groupedDevices).map(([generation, devices]) => (
              <div key={generation}>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  {generation}
                </div>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id} className="text-gray-300">
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
        <div className="bg-gray-900 rounded-lg p-4 space-y-4 border border-gray-800">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Screen</span>
            <span className="text-xs font-mono text-gray-300">
              {selectedDevice.width}x{selectedDevice.height}
            </span>
          </div>
          {selectedDevice.notch && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Notch</span>
              <span className="text-xs font-mono text-gray-300">
                {selectedDevice.notch.width}x{selectedDevice.notch.height}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Scale</span>
            <span className="text-xs font-mono text-gray-300">
              {selectedDevice.scale}x
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Corner</span>
            <span className="text-xs font-mono text-gray-300">
              {selectedDevice.cornerRadius}px
            </span>
          </div>
        </div>
      )}

      {!selectedDevice && (
        <div className="bg-gray-900 rounded-lg p-4 text-center text-xs text-gray-500 border border-gray-800">
          Selecione um dispositivo
        </div>
      )}
    </div>
  );
}
