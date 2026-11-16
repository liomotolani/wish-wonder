'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircleIcon } from '@/app/_components/icons';

interface ApprovalToggleProps {
  initialEnabled: boolean;
}

export function ApprovalToggle({ initialEnabled }: ApprovalToggleProps) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: boolean) {
    setEnabled(next);
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/organiser/family', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requiresApproval: next }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setEnabled(!next);
        setError(data.error ?? 'We could not change that setting just now.');
        return;
      }

      router.refresh();
    } catch {
      setEnabled(!next);
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label
        htmlFor="approval-toggle"
        className="flex cursor-pointer items-center justify-between gap-3 rounded-xl focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pine-900"
      >
        <span>
          <span className="block text-sm font-bold text-ink">Approve new members</span>
          <span className="mt-0.5 block text-xs text-muted">
            Check who joins before they see any lists.
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">
            {enabled ? 'On' : 'Off'}
          </span>
          <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center">
            <input
              id="approval-toggle"
              type="checkbox"
              checked={enabled}
              disabled={saving}
              onChange={(event) => void change(event.target.checked)}
              className="peer h-6 w-6 appearance-none rounded-md border-2 border-pine-100 bg-white checked:border-cranberry checked:bg-cranberry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            />
            <svg
              className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m4 12 5 5L20 6" />
            </svg>
          </span>
        </span>
      </label>

      {error ? (
        <p role="alert" className="mt-3 flex items-start gap-2 text-xs text-cranberry-ink">
          <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
