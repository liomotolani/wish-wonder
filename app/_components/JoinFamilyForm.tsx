'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircleIcon } from '@/app/_components/icons';

interface JoinFamilyFormProps {
  inviteCode: string;
  familyName: string;
  requiresApproval: boolean;
}

export function JoinFamilyForm({
  inviteCode,
  familyName,
  requiresApproval,
}: JoinFamilyFormProps) {
  const router = useRouter();
  const [memberName, setMemberName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/join/${inviteCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberName }),
      });
      const data = (await response.json()) as {
        personalLink?: string;
        next?: string;
        memberStatus?: 'active' | 'pending';
        error?: string;
      };

      if (!response.ok || !data.personalLink) {
        setError(data.error ?? 'We could not join you to the family just now.');
        return;
      }

      if (data.next) {
        router.push(data.next);
        return;
      }

      const token = new URL(data.personalLink).pathname.split('/').filter(Boolean).pop() ?? '';
      const status = data.memberStatus === 'pending' ? 'pending' : 'active';
      router.push(`/personal-link?token=${token}&status=${status}`);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div>
        <label htmlFor="join-name" className="mb-2 block text-sm font-bold text-snow/85">
          What does the family call you?
        </label>
        <input
          id="join-name"
          name="memberName"
          type="text"
          required
          maxLength={40}
          value={memberName}
          onChange={(event) => setMemberName(event.target.value)}
          placeholder="James"
          autoComplete="given-name"
          className="w-full rounded-2xl border border-snow/25 bg-snow/10 px-5 py-3.5 text-base text-snow placeholder:text-snow/60 focus:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        />
        <p className="mt-2 text-sm leading-relaxed text-snow/60">
          This must be different from everyone else&apos;s name in the family.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-2xl border border-cranberry/40 bg-cranberry/15 px-4 py-3 text-sm text-snow"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          {error}
        </p>
      ) : null}

      {requiresApproval ? (
        <p className="mt-5 rounded-2xl bg-snow/10 px-4 py-3 text-sm leading-relaxed text-snow/70">
          {familyName} checks new members. You&apos;ll see your lists as soon as the organiser
          lets you in.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-8 w-full rounded-full bg-cranberry px-6 py-4 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-70"
      >
        {submitting ? 'Joining the family…' : 'Join family'}
      </button>
      <p className="mt-4 text-center text-sm text-snow/60">No account or password needed.</p>
    </form>
  );
}
