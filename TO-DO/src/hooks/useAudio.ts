import { useEffect, useRef, useState } from 'react';

import { toggleWhiteNoise } from '@/utils/sound';

export const useAudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const toggle = () => {
    setIsPlaying(prev => {
      audioCtxRef.current = toggleWhiteNoise(audioCtxRef.current, prev);
      return !prev;
    });
  };

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, []);

  return { isPlaying, toggle };
};
