import { useEffect, useRef } from 'react';

export const useAutoSave = <T,>(
  data: T,
  saveFn: (data: T) => void,
  delay: number = 1000,
  enabled: boolean = true
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);

  useEffect(() => {
    if (!enabled) return;

    const dataChanged = JSON.stringify(data) !== JSON.stringify(previousDataRef.current);

    if (dataChanged) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        saveFn(data);
        previousDataRef.current = data;
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFn, delay, enabled]);
};
