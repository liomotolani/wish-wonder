'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MotionDialog } from '@/app/_components/motion';
import { AlertCircleIcon, CloseIcon, PlusIcon } from '@/app/_components/icons';

interface EventActionsProps {
  activeEvent: { id: string; name: string } | null;
  groupWord: string;
}

type PendingAction = 'archive' | 'new';

export function EventActions({ activeEvent, groupWord }: EventActionsProps) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [action, setAction] = useState<PendingAction>('new');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open(nextAction: PendingAction) {
    setAction(nextAction);
    setError(null);
    dialog.current?.showModal();
  }

  async function confirm() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(
        action === 'archive'
          ? `/api/organiser/events/${activeEvent?.id}/archive`
          : '/api/organiser/events',
        { method: 'POST' },
      );
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? 'We could not update the event just now.');
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
      <div className="flex flex-wrap items-center gap-2">
        {activeEvent ? (
          <button
            type="button"
            onClick={() => open('archive')}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-pine-100 px-4 text-sm font-bold text-ink hover:bg-pine-100/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
          >
            Archive
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => open('new')}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-cranberry px-5 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          <PlusIcon className="h-4 w-4" />
          New event
        </button>
      </div>

      <MotionDialog
        dialogRef={dialog}
        labelledBy="event-action-title"
        className="max-w-md"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id="event-action-title" className="text-xl font-extrabold tracking-tight">
              {action === 'archive'
                ? `Archive ${activeEvent?.name}?`
                : 'Start the next Christmas?'}
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
            {action === 'archive'
              ? `${activeEvent?.name} will be closed. Its gifts and claims stay in the history, but they will no longer appear on the Home page.`
              : activeEvent
                ? `This closes the current event and starts a fresh one. Your ${groupWord} and members stay the same; wish lists begin again.`
                : `This starts a fresh Christmas event. Your ${groupWord} and members stay the same; wish lists begin again.`}
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
              onClick={() => void confirm()}
              disabled={busy}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-5 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:opacity-70"
            >
              {busy ? 'Working…' : action === 'archive' ? 'Archive event' : 'Start new event'}
            </button>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-snow px-5 text-sm font-bold text-ink hover:bg-pine-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              Cancel
            </button>
          </div>
        </div>
      </MotionDialog>
    </>
  );
}
