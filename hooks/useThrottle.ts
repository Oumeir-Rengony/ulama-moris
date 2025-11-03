import { useRef, useCallback } from 'react';

/**
 * Returns a throttled version of a callback function.
 * @param callback - The function to throttle
 * @param interval - Minimum time between calls in ms
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  interval: number = 500
): (...args: Parameters<T>) => void {
  const lastCalled = useRef<number>(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedCallback = useRef<T>(callback);

  // Always keep the latest callback
  savedCallback.current = callback;

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    const invoke = () => {
      lastCalled.current = Date.now();
      savedCallback.current(...args);
    };

    if (now - lastCalled.current >= interval) {
      invoke();
    } else {
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        invoke();
        timeout.current = null;
      }, interval - (now - lastCalled.current));
    }
  }, [interval]);
}