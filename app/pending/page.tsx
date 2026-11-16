import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@/app/_components/Logo';
import { LockIcon } from '@/app/_components/icons';
import { getViewer } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Waiting to be approved',
  robots: { index: false, follow: false },
};

export default async function PendingPage() {
  const viewer = await getViewer();

  if (!viewer) {
    redirect('/');
  }

  if (viewer.member.status === 'active') {
    redirect('/family');
  }

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8 sm:py-12">
          <Logo href="/" />
          <main id="main" className="flex flex-1 flex-col justify-center py-12">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-[20px] bg-gold text-pine-900">
              <LockIcon className="h-7 w-7" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-gold">
              You&apos;re nearly in
            </p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Waiting for {viewer.family.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-snow/70">
              Hi {viewer.member.displayName}. Your organiser needs to approve you before you can
              see the family lists. Save your personal link and come back when they have.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex min-h-14 w-fit items-center justify-center rounded-full border border-snow/25 px-7 text-base font-bold text-snow hover:bg-snow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Back to Wish &amp; Wonder
            </Link>
          </main>
        </div>
      </div>
    </div>
  );
}
