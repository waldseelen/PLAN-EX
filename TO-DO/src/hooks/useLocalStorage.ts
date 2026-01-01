import { useEffect, useRef, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

const readStorageValue = <T,>(key: string, initialValue: T | (() => T)) => {
  if (!isBrowser) {
    return typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item !== null) {
      return JSON.parse(item) as T;
    }
  } catch (error) {
    console.warn(`useLocalStorage: failed to parse value for key "${key}"`, error);
  }

  return typeof initialValue === 'function'
    ? (initialValue as () => T)()
    : initialValue;
};

export const useLocalStorage = <T,>(key: string, initialValue: T | (() => T)) => {
  const [value, setValue] = useState<T>(() => readStorageValue(key, initialValue));
  const previousKeyRef = useRef(key);

  useEffect(() => {
    if (previousKeyRef.current !== key) {
      previousKeyRef.current = key;
      setValue(readStorageValue(key, initialValue));
    }
  }, [initialValue, key]);

  useEffect(() => {
    if (!isBrowser) return;
    
    const handler = setTimeout(() => {
      try {
        const serialized = JSON.stringify(value);
        const currentValue = window.localStorage.getItem(key);
        
        if (currentValue !== serialized) {
          window.localStorage.setItem(key, serialized);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.error(`useLocalStorage: Storage quota exceeded for key "${key}"`);
        } else {
          console.warn(`useLocalStorage: failed to write value for key "${key}"`, error);
        }
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [key, value]);

  return [value, setValue] as const;
};
