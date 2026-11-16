'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircleIcon } from '@/app/_components/icons';

export function AddManagedMemberForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/managed-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        managedMemberId?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.managedMemberId) {
        setError(data.error ?? 'We could not add them just now. Please try again.');
        return;
      }

      router.push(`/wishlist/managed/${data.managedMemberId}`);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="managed-name" className="mb-2 block text-sm font-bold text-ink">
          Their name
        </label>
        <input
          id="managed-name"
          name="displayName"
          type="text"
          required
          maxLength={40}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="Baby Leo"
          className="w-full rounded-2xl border border-pine-100 bg-white px-4 py-3.5 text-base text-ink placeholder:text-muted focus:border-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        />
        <p className="mt-2 text-sm leading-relaxed text-muted">
          They don&apos;t need a phone or a personal link. You&apos;ll add and edit their gifts
          for them.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-cranberry/30 bg-cranberry/10 px-4 py-3 text-sm text-cranberry-ink"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-cranberry px-6 py-4 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? 'Adding them…' : 'Add person'}
        </button>
        <Link
          href="/wishlist"
          className="block w-full rounded-full px-6 py-3 text-center text-sm font-bold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
