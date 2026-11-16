'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { AlertCircleIcon, MinusCircleIcon } from '@/app/_components/icons';
import { CONFIRMATION } from '@/app/_components/motion';
import { fireClaimConfetti } from '@/app/_components/motion/celebration';
import { markBoxTaken } from '@/app/_components/reveal-cache';

interface ClaimGiftButtonProps {
  recipientName: string;
  visitId: string;
  number: number;
  backHref: string;
}

type ClaimState = 'idle' | 'submitting' | 'success' | 'already' | 'error';

export function ClaimGiftButton({
  recipientName,
  visitId,
  number,
  backHref,
}: ClaimGiftButtonProps) {
  const [state, setState] = useState<ClaimState>('idle');
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (state !== 'success') {
      return;
    }

    const panel = panelRef.current;

    if (panel) {
      panel.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      });
      panel.focus({ preventScroll: true });
    }

    if (reduce) {
      return;
    }

    let cancelled = false;
    // Start high in the viewport so the celebration is visible even after the
    // confirmation panel has been scrolled to the top.
    void fireClaimConfetti({ x: 0.5, y: 0.28 }, () => cancelled).catch(() => {
      // A missing celebration must never hide the confirmation.
    });

    return () => {
      cancelled = true;
    };
  }, [state, reduce]);

  async function handleClaim() {
    setState('submitting');
    setError(null);

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitId, number }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        reason?: string;
        error?: string;
      };

      if (response.ok && data.ok) {
        markBoxTaken(visitId, number);
        setState('success');
        return;
      }

      if (data.reason === 'already_picked') {
        setState('already');
        return;
      }

      setError(data.error ?? 'We could not reserve that gift just now. Please try again.');
      setState('error');
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
      setState('error');
    }
  }

  if (state === 'success') {
    return (
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        variants={CONFIRMATION}
        initial="hidden"
        animate="visible"
        className="relative scroll-mt-4 overflow-hidden rounded-3xl bg-pine-900 p-6 text-snow focus:outline-none"
        role="status"
        aria-live="polite"
      >
        <div className="relative">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-gold">You&apos;re in</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
            This gift is secretly reserved for you!
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-snow/75">
            {recipientName} won&apos;t know a thing. You&apos;ll find it in Secret Gifts whenever
            you need the details.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/family"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-5 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Back to family
            </Link>
            <Link
              href={backHref}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-snow/25 px-5 text-sm font-bold text-snow hover:bg-snow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Keep looking
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (state === 'already') {
    return (
      <div className="rounded-3xl bg-white p-6 text-ink" role="alert" aria-live="assertive">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cranberry/10 text-cranberry-ink">
          <MinusCircleIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight">Already picked</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Someone claimed this gift while you were looking. Don&apos;t worry, there are more
          numbers to try.
        </p>
        <Link
          href={backHref}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-cranberry px-5 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          Try Another Number
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => void handleClaim()}
          disabled={state === 'submitting'}
          className="w-full rounded-full bg-cranberry px-6 py-4 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:cursor-wait disabled:opacity-70"
        >
          {state === 'submitting' ? 'Reserving your gift…' : "I'll Buy This"}
        </button>
        <Link
          href={backHref}
          className="flex w-full items-center justify-center rounded-full bg-snow px-6 py-4 text-base font-bold text-ink transition-colors hover:bg-pine-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          Try Another Number
        </Link>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {state === 'submitting' ? 'Reserving your gift.' : ''}
      </span>

      {error ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl border border-cranberry/30 bg-cranberry/10 px-4 py-3 text-sm text-cranberry-ink"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <p className="sr-only">
        You are buying for {recipientName}. Your claim is secret from them.
      </p>
    </div>
  );
}
