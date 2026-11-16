'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircleIcon } from '@/app/_components/icons';

interface CreateFamilyFormProps {
  initialRequiresApproval?: boolean;
}

const INPUT_CLASS =
  'w-full rounded-2xl border border-snow/25 bg-snow/10 px-5 py-3.5 text-base text-snow placeholder:text-snow/60 focus:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';
const LABEL_CLASS = 'mb-2 block text-sm font-bold text-snow/85';

export function CreateFamilyForm({ initialRequiresApproval = true }: CreateFamilyFormProps) {
  const router = useRouter();
  const [familyName, setFamilyName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [requiresApproval, setRequiresApproval] = useState(initialRequiresApproval);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyName, memberName, requiresApproval }),
      });
      const data = (await response.json()) as {
        personalLink?: string;
        next?: string;
        error?: string;
      };

      if (!response.ok || !data.personalLink) {
        setError(data.error ?? 'We could not create your family just now. Please try again.');
        return;
      }

      router.push(data.next ?? '/personal-link?created=1');
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
      <div className="space-y-5">
        <div>
          <label htmlFor="family-name" className={LABEL_CLASS}>
            Family name
          </label>
          <input
            id="family-name"
            name="familyName"
            type="text"
            required
            maxLength={80}
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
            placeholder="e.g. The Williams Family Christmas 2026"
            className={INPUT_CLASS}
            autoComplete="organization"
          />
        </div>

        <div>
          <label htmlFor="member-name" className={LABEL_CLASS}>
            Your name
          </label>
          <input
            id="member-name"
            name="memberName"
            type="text"
            required
            maxLength={40}
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            placeholder="e.g. Mum"
            className={INPUT_CLASS}
            autoComplete="given-name"
          />
        </div>

        <label
          htmlFor="requires-approval"
          className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-snow/10 px-5 py-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold"
        >
          <span>
            <span className="block text-base font-bold text-snow">Approve new members</span>
            <span className="mt-0.5 block text-sm text-snow/70">
              Check who joins before they see any lists
            </span>
          </span>
          <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
            <input
              id="requires-approval"
              name="requiresApproval"
              type="checkbox"
              checked={requiresApproval}
              onChange={(event) => setRequiresApproval(event.target.checked)}
              className="peer h-7 w-7 appearance-none rounded-md border-2 border-snow/40 bg-transparent checked:border-cranberry checked:bg-cranberry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            />
            <svg
              className="pointer-events-none absolute h-4 w-4 text-snow opacity-0 peer-checked:opacity-100"
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
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2 rounded-2xl border border-cranberry/40 bg-cranberry/15 px-4 py-3 text-sm text-snow"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          {error}
        </p>
      ) : null}

      <div className="mt-auto pt-10">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-cranberry px-6 py-4 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? 'Creating your family…' : 'Create family'}
        </button>
        <p className="mt-4 text-center text-sm text-snow/60">
          You&apos;ll be the organiser. You can change this later.
        </p>
      </div>
    </form>
  );
}
