import Link from 'next/link';
import { Logo } from '@/app/_components/Logo';

export default function NotFound() {
  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8 sm:py-12">
          <Logo href="/" />
          <main id="main" className="flex flex-1 flex-col justify-center py-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Nothing under the tree
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              We couldn&apos;t find that page
            </h1>
            <p className="mt-4 text-base leading-relaxed text-snow/70">
              The link may be old, or the gift may have been removed. Head back to the Home
              page and try again.
            </p>
            <Link
              href="/family"
              className="mt-8 inline-flex min-h-14 w-fit items-center justify-center rounded-full bg-cranberry px-7 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Back to Home
            </Link>
          </main>
        </div>
      </div>
    </div>
  );
}
