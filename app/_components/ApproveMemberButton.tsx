'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircleIcon, CheckIcon } from '@/app/_components/icons';

interface ApproveMemberButtonProps {
  memberId: string;
  displayName: string;
  label?: string;
}

export function ApproveMemberButton({
  memberId,
  displayName,
  label = 'Let them in',
}: ApproveMemberButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  async function approve() {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/organiser/members/${memberId}/approve`, {
        method: 'POST',
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? 'We could not let them in just now.');
        return;
      }

      setAnnouncement(`${displayName} has been approved.`);
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="sr-only" role="status" aria-live="polite">
        {announcement}
      </span>
      <button
        type="button"
        onClick={approve}
        disabled={busy}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-pine-900 px-4 text-sm font-bold text-snow transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:opacity-70"
      >
        <CheckIcon className="h-4 w-4" />
        {busy ? 'Letting in…' : label}
        <span className="sr-only"> {displayName}</span>
      </button>
      {error ? (
        <p
          role="alert"
          className="mt-2 flex items-start gap-1.5 text-xs text-cranberry-ink"
        >
          <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
