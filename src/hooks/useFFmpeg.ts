import { useEffect, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';

const ffmpeg = new FFmpeg();

export function useFFmpeg() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        ffmpeg.on('log', ({ message }) => console.log(message));
        await ffmpeg.load();
        if (mounted) {
          setLoaded(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load FFmpeg');
        }
      }
    };

    if (!ffmpeg.loaded) {
      load();
    } else {
      // Already loaded, don't set state
      // The initial state is false, which is correct for first render
    }

    return () => {
      mounted = false;
    };
  }, []);

  return { ffmpeg, loaded, error };
}
