'use client';

import Link from 'next/link';
import { AlertCircleIcon } from '@/app/_components/icons';

interface ErrorPageProps {
  reset: () => void;
}

export default function PickerError({ reset }: ErrorPageProps) {
  return (
    <main className="theme-dark flex min-h-screen flex-col items-center justify-center bg-pine-900 px-5 text-center text-snow">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-snow/10 text-gold">
        <AlertCircleIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight">The mystery paused</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-snow/70">
        We couldn&apos;t load the gift numbers just now. Nothing has been claimed.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-6 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        Try again
      </button>
      <Link
        href="/family"
        className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-snow/60 hover:text-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        Back to family
      </Link>
    </main>
  );
}
