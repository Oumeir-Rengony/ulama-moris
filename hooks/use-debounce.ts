import debounce from "lodash.debounce";
import { useEffect, useMemo, useRef } from "react";

interface DebounceSettings {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  wait = 500,
  dependencies: React.DependencyList = [],
  options?: DebounceSettings
): {
  (this: ThisParameterType<T>, ...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
} {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const handler = useMemo(
    () =>
      debounce(function (this: ThisParameterType<T>, ...args: Parameters<T>) {
        return fnRef.current.apply(this, args);
      }, wait, options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wait, options, ...dependencies]
  );

  useEffect(() => {
    return () => {
      handler.cancel();
    };
  }, [handler]);

  return handler as {
    (this: ThisParameterType<T>, ...args: Parameters<T>): void;
    cancel: () => void;
    flush: () => ReturnType<T> | undefined;
  };
}