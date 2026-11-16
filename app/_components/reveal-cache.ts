import type { RevealedGiftView } from '@/lib/types';

export type RevealFailureReason =
  | 'taken'
  | 'not_found'
  | 'not_allowed'
  | 'rate_limited'
  | 'expired'
  | 'error';

export interface RevealResponse {
  ok: boolean;
  gift?: RevealedGiftView;
  recipientName?: string;
  reason?: RevealFailureReason;
  error?: string;
}

const memory = new Map<string, RevealResponse>();
const inflight = new Map<string, Promise<RevealResponse>>();
const boxListeners = new Set<() => void>();

export function subscribeBoxState(onChange: () => void): () => void {
  boxListeners.add(onChange);

  return () => {
    boxListeners.delete(onChange);
  };
}

function cacheKey(visitId: string, number: number): string {
  return `ww-reveal:${visitId}:${number}`;
}

function boxKey(visitId: string, number: number): string {
  return `ww-box:${visitId}:${number}`;
}

export type CachedBoxState = 'peeked' | 'taken';

/** The tile state to restore when the picker comes back from a reveal. */
export function readBoxState(
  visitId: string,
  number: number,
): CachedBoxState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.sessionStorage.getItem(boxKey(visitId, number));
    return value === 'peeked' || value === 'taken' ? value : null;
  } catch {
    return null;
  }
}

export function markBoxTaken(visitId: string, number: number): void {
  markBoxState(visitId, number, 'taken');
}

function markBoxState(
  visitId: string,
  number: number,
  value: CachedBoxState,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(boxKey(visitId, number), value);
  } catch {
    // Storage can be disabled; the reveal still works.
  }

  boxListeners.forEach((listener) => listener());
}

export function readCachedReveal(
  visitId: string,
  number: number,
): RevealResponse | null {
  const key = cacheKey(visitId, number);
  const cached = memory.get(key);

  if (cached) {
    return cached;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.sessionStorage.getItem(key);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as RevealResponse;
    memory.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

export function cacheReveal(
  visitId: string,
  number: number,
  response: RevealResponse,
): void {
  const key = cacheKey(visitId, number);
  memory.set(key, response);

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(key, JSON.stringify(response));
  } catch {
    // Storage can be disabled or full; the in-memory copy is enough.
  }
}

/**
 * Fetch (or join an in-flight fetch for) one revealed gift. The picker starts
 * this as soon as a box is tapped; the reveal screen picks up the same promise.
 */
export async function fetchReveal(
  visitId: string,
  number: number,
): Promise<RevealResponse> {
  const cached = readCachedReveal(visitId, number);

  if (cached) {
    return cached;
  }

  const key = cacheKey(visitId, number);
  const existing = inflight.get(key);

  if (existing) {
    return existing;
  }

  const request = (async (): Promise<RevealResponse> => {
    try {
      const response = await fetch('/api/picker/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId, number }),
        cache: 'no-store',
      });
      const data = (await response.json()) as RevealResponse;

      if (!response.ok && !data.reason) {
        return {
          ok: false,
          reason: 'error',
          error: data.error ?? 'We could not open that box just now.',
        };
      }

      const result: RevealResponse = {
        ...data,
        ok: data.ok === true,
      };

      // A known result is stable (the box is peeked or taken). A temporary
      // server/network failure is not cached, so the reveal screen can retry.
      if (result.ok || result.reason !== 'error') {
        cacheReveal(visitId, number, result);
      }

      if (result.ok) {
        markBoxState(visitId, number, 'peeked');
      } else if (result.reason === 'taken') {
        markBoxState(visitId, number, 'taken');
      }

      return result;
    } catch {
      return {
        ok: false,
        reason: 'error',
        error: 'We could not reach the server. Check your connection and try again.',
      };
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  return request;
}

/** Start the reveal in the background while the tile animates. */
export function prefetchReveal(visitId: string, number: number): void {
  if (!visitId) {
    return;
  }

  void fetchReveal(visitId, number);
}
