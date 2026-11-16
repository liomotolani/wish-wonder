'use client';

import Link from 'next/link';
import { AlertCircleIcon } from '@/app/_components/icons';

interface ErrorPageProps {
  reset: () => void;
}

export default function AppError({ reset }: ErrorPageProps) {
  return (
    <main id="main" className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-20 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cranberry/10 text-cranberry-ink">
        <AlertCircleIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        We couldn&apos;t load this page just now. Your lists and secret gifts are safe.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-6 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
      >
        Try again
      </button>
      <Link
        href="/family"
        className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
      >
        Back to family
      </Link>
    </main>
  );
}
