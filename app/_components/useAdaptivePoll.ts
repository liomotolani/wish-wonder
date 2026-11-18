'use client';

import { useEffect, useRef } from 'react';

const FAST_MS = 3000;
const SLOW_MS = 10000;
const ACTIVE_WINDOW_MS = 60_000;

/**
 * Polls quickly for a minute after the tab opens or the person touches the
 * page, then settles to a slower rhythm. Hidden tabs pause via the browser;
 * coming back immediately checks and speeds up again.
 */
export function useAdaptivePoll(check: () => void | Promise<void>): void {
  const checkRef = useRef(check);

  useEffect(() => {
    checkRef.current = check;
  }, [check]);

  useEffect(() => {
    let timer = 0;
    let fastUntil = Date.now() + ACTIVE_WINDOW_MS;
    let stopped = false;

    function bump() {
      fastUntil = Date.now() + ACTIVE_WINDOW_MS;
    }

    function schedule() {
      if (stopped) {
        return;
      }

      const delay = Date.now() < fastUntil ? FAST_MS : SLOW_MS;
      timer = window.setTimeout(async () => {
        await checkRef.current();
        schedule();
      }, delay);
    }

    function handleActivity() {
      bump();
    }

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        bump();
        void checkRef.current();
      }
    }

    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity);
    document.addEventListener('visibilitychange', handleVisibility);
    schedule();

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
}
