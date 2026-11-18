'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { animate, useReducedMotion } from 'motion/react';
import { Bauble } from '@/app/_components/Bauble';
import { GiftThumbnail } from '@/app/_components/GiftThumbnail';
import { MotionDialog, SPRING } from '@/app/_components/motion';
import {
  AlertCircleIcon,
  CloseIcon,
  ExternalLinkIcon,
  StarIcon,
} from '@/app/_components/icons';
import { formatPrice, preferenceChips } from '@/lib/format';
import { PRIORITY_REALLY_WANT } from '@/lib/validation';
import type { ClaimedGiftView } from '@/lib/types';

interface SecretGiftActionsProps {
  claimId: string;
  status: 'reserved' | 'purchased';
  recipientName: string;
  gift: ClaimedGiftView;
  layout: 'mobile' | 'desktop';
}

export function SecretGiftActions({
  claimId,
  status,
  recipientName,
  gift,
  layout,
}: SecretGiftActionsProps) {
  const idSuffix = `${claimId}-${layout}`;
  const router = useRouter();
  const reduce = useReducedMotion();
  const viewDialog = useRef<HTMLDialogElement>(null);
  const releaseDialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const price = formatPrice(gift.pricePence, gift.currency);
  const chips = preferenceChips(gift.preferences);
  const isPriority = gift.priority === PRIORITY_REALLY_WANT;

  async function update(action: 'purchase' | 'release') {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? 'We could not update that gift just now.');
        return;
      }

      setAnnouncement(
        action === 'purchase' ? 'Gift marked as purchased.' : 'Gift released.',
      );

      const item = releaseDialog.current?.closest<HTMLElement>('[data-claim-item]');

      releaseDialog.current?.close();

      if (action === 'release' && item && !reduce) {
        await animate(item, { opacity: 0, scale: 0.98 }, SPRING.pop);
      }

      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {status === 'reserved' ? (
          <button
            type="button"
            onClick={() => update('purchase')}
            disabled={busy}
            className="min-h-11 rounded-full bg-pine-900 px-5 text-sm font-bold text-snow transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:opacity-70"
          >
            {busy ? 'Saving…' : 'Mark Purchased'}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => viewDialog.current?.showModal()}
          className="min-h-11 rounded-full bg-snow px-5 text-sm font-bold text-ink transition-colors hover:bg-pine-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          View
        </button>

        <button
          type="button"
          onClick={() => {
            setError(null);
            releaseDialog.current?.showModal();
          }}
          className="min-h-11 rounded-full px-3 text-sm font-bold text-cranberry-ink hover:bg-cranberry/5 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          Release
        </button>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-2xl border border-cranberry/30 bg-cranberry/10 px-4 py-3 text-sm text-cranberry-ink"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <MotionDialog
        dialogRef={viewDialog}
        labelledBy={`view-gift-${idSuffix}`}
        className="max-w-lg"
      >
        <div className="flex items-start justify-between gap-4 border-b border-pine-100 p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
              For {recipientName}
            </p>
            <h2
              id={`view-gift-${idSuffix}`}
              className="mt-1 text-xl font-extrabold tracking-tight"
            >
              {gift.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => viewDialog.current?.close()}
            aria-label="Close gift details"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-snow text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <GiftThumbnail
            giftId={claimId}
            imageUrl={gift.imageUrl}
            className="aspect-[16/10] w-full rounded-2xl"
          />

          <div className="mt-4 flex items-start justify-between gap-3">
            <h3 className="text-lg font-extrabold">{gift.name}</h3>
            {price ? <span className="font-extrabold text-pine-700">{price}</span> : null}
          </div>

          {chips.length > 0 || isPriority ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip} className="rounded-full bg-snow px-3 py-1 text-sm font-semibold">
                  {chip}
                </li>
              ))}
              {isPriority ? (
                <li className="inline-flex items-center gap-1 rounded-full bg-cranberry/10 px-3 py-1 text-sm font-bold text-cranberry-ink">
                  <StarIcon className="h-3 w-3" />
                  Really want this
                </li>
              ) : null}
            </ul>
          ) : null}

          {gift.description ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">{gift.description}</p>
          ) : null}

          {gift.shopUrl ? (
            <a
              href={gift.shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-ink underline underline-offset-4 hover:text-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              View product
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </MotionDialog>

      <MotionDialog
        dialogRef={releaseDialog}
        labelledBy={`release-gift-${idSuffix}`}
        className="max-w-lg"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Bauble name={recipientName} />
              <div>
                <p className="text-sm font-extrabold">{gift.name}</p>
                <p className="text-xs text-muted">
                  For {recipientName}
                  {price ? ` · ${price}` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => releaseDialog.current?.close()}
              aria-label="Close release confirmation"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-snow text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <h2
            id={`release-gift-${idSuffix}`}
            className="mt-5 text-2xl font-extrabold tracking-tight"
          >
            Release this gift?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            It goes back into {recipientName}&apos;s mystery numbers for someone else to claim,
            and disappears from your Secret Gifts.
          </p>

          {error ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-2xl border border-cranberry/30 bg-cranberry/10 px-4 py-3 text-sm text-cranberry-ink"
            >
              <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <div className="mt-6 space-y-2">
            <button
              type="button"
              onClick={() => update('release')}
              disabled={busy}
              className="flex min-h-14 w-full items-center justify-center rounded-full bg-cranberry px-6 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:opacity-70"
            >
              {busy ? 'Releasing…' : 'Release gift'}
            </button>
            <button
              type="button"
              onClick={() => releaseDialog.current?.close()}
              className="flex min-h-14 w-full items-center justify-center rounded-full bg-snow px-6 text-base font-bold text-ink hover:bg-pine-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              Keep it
            </button>
          </div>
        </div>
      </MotionDialog>
    </>
  );
}
