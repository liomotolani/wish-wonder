import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/app/_components/Logo';
import { KeyIcon } from '@/app/_components/icons';

export const metadata: Metadata = {
  title: 'This link no longer works',
  robots: { index: false, follow: false },
};

export default function LinkExpiredPage() {
  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8 sm:py-12">
          <Logo href="/" />
          <main id="main" className="flex flex-1 flex-col justify-center py-12">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-[20px] bg-snow/10 text-gold">
              <KeyIcon className="h-7 w-7" />
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              This link no longer works
            </h1>
            <p className="mt-4 text-base leading-relaxed text-snow/70">
              Ask your group organiser for a new personal link. They can make one for you from
              the home page.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex min-h-14 w-fit items-center justify-center rounded-full bg-cranberry px-7 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Back to Wish &amp; Wonder
            </Link>
          </main>
        </div>
      </div>
    </div>
  );
}
