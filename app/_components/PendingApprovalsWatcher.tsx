'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdaptivePoll } from './useAdaptivePoll';

/**
 * Refreshes the organiser's dashboard when the number of pending approvals
 * changes, so a new join request appears without a manual reload.
 */
export function PendingApprovalsWatcher({ initialCount }: { initialCount: number }) {
  const router = useRouter();
  const lastCount = useRef(initialCount);

  useEffect(() => {
    lastCount.current = initialCount;
  }, [initialCount]);

  useAdaptivePoll(async () => {
    try {
      const response = await fetch('/api/organiser/pending-count', {
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as { count?: number };

      if (typeof data.count === 'number' && data.count !== lastCount.current) {
        lastCount.current = data.count;
        router.refresh();
      }
    } catch {
      // A temporary network failure just waits for the next poll.
    }
  });

  return null;
}
