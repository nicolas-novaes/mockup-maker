import { useEffect, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const ffmpeg = new FFmpeg();

export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        ffmpeg.on('log', ({ message }) => console.log(message));
        await ffmpeg.load();
        setLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load FFmpeg');
      }
    };

    if (!ffmpeg.loaded) {
      load();
    } else {
      setLoaded(true);
    }
  }, []);

  return { ffmpeg, loaded, error };
}
