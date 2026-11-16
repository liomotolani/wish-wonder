'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * SSR-safe media query hook. False on the server, then the real value once
 * mounted. Backed by `useSyncExternalStore` so it stays in step with the OS.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const LAPTOP_QUERY = '(min-width: 1024px)';

export function useIsLaptop(): boolean {
  return useMediaQuery(LAPTOP_QUERY);
}
