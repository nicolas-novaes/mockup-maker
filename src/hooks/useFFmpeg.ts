import { useEffect, useState } from 'react';
import { FFmpeg, toBlobURL } from '@ffmpeg/ffmpeg';

const ffmpeg = new FFmpeg();

export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
      try {
        ffmpeg.on('log', ({ message }) => console.log(message));
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load FFmpeg');
      }
    };

    if (!ffmpeg.isLoaded()) {
      load();
    } else {
      setLoaded(true);
    }
  }, []);

  return { ffmpeg, loaded, error };
}
