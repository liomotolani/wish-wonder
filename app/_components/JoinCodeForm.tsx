'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircleIcon, ArrowRightIcon } from '@/app/_components/icons';
import { extractInviteCode } from '@/lib/validation';

export function JoinCodeForm() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = extractInviteCode(value);

    if (!code) {
      setError('Paste the invite link your organiser sent, or the code from it.');
      return;
    }

    router.push(`/join/${code}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="invite-code" className="mb-2 block text-sm font-bold text-snow/85">
        Invite link or code
      </label>
      <input
        id="invite-code"
        name="inviteCode"
        type="text"
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="e.g. wishandwonder.app/join/0a1b2c3d4e5f6a7b"
        className="w-full rounded-2xl border border-snow/25 bg-snow/10 px-5 py-3.5 text-base text-snow placeholder:text-snow/60 focus:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      />
      <p className="mt-2 text-sm text-snow/60">
        It looks like a link ending in 16 letters and numbers.
      </p>

      {error ? (
        <p
          role="alert"
          className="mt-5 flex items-start gap-2 rounded-2xl border border-cranberry/40 bg-cranberry/15 px-4 py-3 text-sm text-snow"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cranberry px-6 py-4 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        Find my family
        <ArrowRightIcon className="h-5 w-5" />
      </button>
    </form>
  );
}
