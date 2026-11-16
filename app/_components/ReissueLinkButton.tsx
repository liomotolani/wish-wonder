'use client';

import { useRef, useState } from 'react';
import { CopyButton } from '@/app/_components/CopyButton';
import { MotionDialog } from '@/app/_components/motion';
import { AlertCircleIcon, CloseIcon } from '@/app/_components/icons';

interface ReissueLinkButtonProps {
  memberId: string;
  displayName: string;
  isSelf: boolean;
}

export function ReissueLinkButton({
  memberId,
  displayName,
  isSelf,
}: ReissueLinkButtonProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<'confirm' | 'link'>('confirm');
  const [personalLink, setPersonalLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open() {
    setStep('confirm');
    setPersonalLink(null);
    setError(null);
    dialog.current?.showModal();
  }

  function close() {
    dialog.current?.close();
    setStep('confirm');
    setPersonalLink(null);
    setError(null);
  }

  async function reissue() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/organiser/members/${memberId}/reissue-link`, {
        method: 'POST',
      });
      const data = (await response.json()) as {
        personalLink?: string;
        error?: string;
      };

      if (!response.ok || !data.personalLink) {
        setError(data.error ?? 'We could not replace that link just now.');
        return;
      }

      setPersonalLink(data.personalLink);
      setStep('link');
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={`Give ${displayName} a new personal link`}
        className="inline-flex min-h-11 items-center rounded-full border border-pine-100 px-4 text-sm font-bold text-ink transition-colors hover:bg-pine-100/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
      >
        <span className="sm:hidden">New link</span>
        <span className="hidden sm:inline">New personal link</span>
      </button>

      <MotionDialog
        dialogRef={dialog}
        labelledBy={`reissue-title-${memberId}`}
        className="max-w-lg"
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2
              id={`reissue-title-${memberId}`}
              className="text-xl font-extrabold tracking-tight"
            >
              {step === 'confirm'
                ? `Give ${displayName} a new link?`
                : `${displayName}'s new personal link`}
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close new personal link"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-snow text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          {step === 'confirm' ? (
            <>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {isSelf
                  ? 'This signs you out on every device, including this one. You will get one new personal link below.'
                  : `This signs ${displayName} out on every device. Their old links will stop working, and you will get one new link to send them.`}
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
                  onClick={() => void reissue()}
                  disabled={busy}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-5 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:opacity-70"
                >
                  {busy ? 'Replacing…' : 'Create new link'}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-snow px-5 text-sm font-bold text-ink hover:bg-pine-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                This is shown once. Copy it now and send it to {isSelf ? 'yourself' : displayName}.
              </p>

              <div className="mt-4">
                <label htmlFor={`new-link-${memberId}`} className="sr-only">
                  New personal link
                </label>
                <input
                  id={`new-link-${memberId}`}
                  type="text"
                  readOnly
                  value={personalLink ?? ''}
                  className="w-full rounded-2xl border border-pine-100 bg-snow px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CopyButton
                  value={personalLink ?? ''}
                  label="Copy link"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-pine-900 px-5 text-sm font-bold text-snow hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
                />
                {isSelf ? (
                  <a
                    href={personalLink ?? '/family'}
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-bold text-pine-900 hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
                  >
                    Open it now
                  </a>
                ) : null}
              </div>

              <button
                type="button"
                onClick={close}
                className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
              >
                Done
              </button>
            </>
          )}
        </div>
      </MotionDialog>
    </>
  );
}
