import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

export function useDebounce(callback, delay = 300) {
  const debouncedCallback = debounce(callback, delay);

  useEffect(() => {
    return () => {
      debouncedCallback.cancel();
    };
  }, [debouncedCallback]);

  return debouncedCallback;
}

// Alternative version that debounces a value instead of a callback
export function useDebouncedValue(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
} 