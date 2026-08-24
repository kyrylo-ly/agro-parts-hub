import { useState, useEffect } from 'react';

/**
 * A custom hook to safely use Zustand store with hydration.
 * It ensures the store state matches between server and client during SSR.
 * 
 * @param store The Zustand store hook
 * @param callback The selector function
 * @returns The selected state or undefined if not hydrated
 */
export function useStoreHydration<T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
}
