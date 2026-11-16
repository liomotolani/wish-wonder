'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MotionDialog } from '@/app/_components/motion';
import { AlertCircleIcon, CloseIcon, TrashIcon } from '@/app/_components/icons';

interface RemoveMemberButtonProps {
  memberId: string;
  displayName: string;
  variant?: 'remove' | 'decline';
}

export function RemoveMemberButton({
  memberId,
  displayName,
  variant = 'remove',
}: RemoveMemberButtonProps) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDecline = variant === 'decline';

  function open() {
    setError(null);
    dialog.current?.showModal();
  }

  async function remove() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/organiser/members/${memberId}`, {
        method: 'DELETE',
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? 'We could not remove that member just now.');
        return;
      }

      dialog.current?.close();
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {isDecline ? (
        <button
          type="button"
          onClick={open}
          className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold text-cranberry-ink hover:bg-cranberry/5 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          Decline
        </button>
      ) : (
        <button
          type="button"
          onClick={open}
          aria-label={`Remove ${displayName}`}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full text-cranberry-ink transition-colors hover:bg-cranberry/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      )}

      <MotionDialog
        dialogRef={dialog}
        labelledBy={`remove-title-${memberId}`}
        className="max-w-md"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2
              id={`remove-title-${memberId}`}
              className="text-xl font-extrabold tracking-tight"
            >
              {isDecline ? `Decline ${displayName}?` : `Remove ${displayName}?`}
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Close"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-snow text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted">
            {isDecline
              ? `${displayName} won't be able to join this family. They can ask for the invite link again.`
              : `${displayName}'s wish list and reservations will be deleted. Anyone who had reserved one of their gifts will be told it is no longer available.`}
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

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void remove()}
              disabled={busy}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-5 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:opacity-70"
            >
              {busy ? 'Working…' : isDecline ? 'Decline request' : 'Remove member'}
            </button>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-snow px-5 text-sm font-bold text-ink hover:bg-pine-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              Keep {displayName}
            </button>
          </div>
        </div>
      </MotionDialog>
    </>
  );
}
