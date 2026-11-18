'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAdaptivePoll } from './useAdaptivePoll';

/**
 * Refreshes an open picker when the recipient's list changes, so a newly added
 * gift appears as a new box without the buyer reloading by hand.
 */
export function PickerAutoRefresh({
  memberId,
  initialTotal,
  initialAvailable,
}: {
  memberId: string;
  initialTotal: number;
  initialAvailable: number;
}) {
  const router = useRouter();
  const last = useRef({ total: initialTotal, available: initialAvailable });

  useEffect(() => {
    last.current = { total: initialTotal, available: initialAvailable };
  }, [initialTotal, initialAvailable]);

  useAdaptivePoll(async () => {
    try {
      const response = await fetch(`/api/picker/${memberId}/count`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const data = (await response.json()) as {
        total?: number;
        available?: number;
      };

      if (
        typeof data.total !== 'number' ||
        typeof data.available !== 'number'
      ) {
        return;
      }

      if (
        data.total !== last.current.total ||
        data.available !== last.current.available
      ) {
        last.current = { total: data.total, available: data.available };
        router.refresh();
      }
    } catch {
      // Keep the current board; the next poll will try again.
    }
  });

  return null;
}
