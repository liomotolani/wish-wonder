'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type BuyState = 'idle' | 'buying' | 'bought' | 'already' | 'error';

/**
 * Claims a gift straight from List view, then opens its product link if there
 * is one. Conflicts fall back to the same "Already picked" state as reveal.
 */
export function ListBuyButton({
  giftId,
  shopUrl,
}: {
  giftId: string;
  shopUrl: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<BuyState>('idle');
  const [error, setError] = useState<string | null>(null);

  async function buy() {
    setState('buying');
    setError(null);

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        reason?: string;
        error?: string;
      };

      if (response.ok && data.ok) {
        setState('bought');

        if (shopUrl) {
          window.location.assign(shopUrl);
          return;
        }

        router.refresh();
        return;
      }

      if (data.reason === 'already_picked') {
        setState('already');
        router.refresh();
        return;
      }

      setError(data.error ?? 'We could not reserve that gift just now.');
      setState('error');
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
      setState('error');
    }
  }

  if (state === 'already') {
    return (
      <span className="inline-flex min-h-12 shrink-0 items-center rounded-full border border-dashed border-snow/30 px-3 text-xs font-bold text-snow/60">
        Already picked
      </span>
    );
  }

  return (
    <span className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => void buy()}
        disabled={state === 'buying' || state === 'bought'}
        className="inline-flex min-h-12 min-w-[5.5rem] shrink-0 items-center justify-center rounded-full bg-cranberry px-5 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-70"
      >
        {state === 'buying' ? 'Buying…' : state === 'bought' ? 'Bought' : 'Buy'}
      </button>
      {error ? (
        <span role="alert" className="max-w-[10rem] text-right text-xs text-cranberry">
          {error}
        </span>
      ) : null}
    </span>
  );
}
