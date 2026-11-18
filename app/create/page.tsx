import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeftIcon } from '@/app/_components/icons';
import { CreateFamilyForm } from '@/app/_components/CreateFamilyForm';
import { getViewer } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Start your group',
  robots: { index: false, follow: false },
};

export default async function CreateFamilyPage() {
  const viewer = await getViewer();
  const isFirstGroup = viewer === null;

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 sm:py-10">
          <Link
            href="/"
            aria-label="Back to the welcome page"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-snow/10 text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:hidden"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>

          <main
            id="main"
            className="flex flex-1 flex-col pt-8 sm:pt-12 lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16 lg:pt-0"
          >
            <div>
              <Link
                href="/"
                className="mb-8 hidden min-h-11 w-fit items-center gap-1 text-sm font-semibold text-snow/70 hover:text-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:inline-flex"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Back
              </Link>
              {isFirstGroup ? (
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                  Step 1 of 2
                </p>
              ) : null}
              <h1
                className={`text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl ${
                  isFirstGroup ? 'mt-3' : ''
                }`}
              >
                Start your group
              </h1>
              <p className="mt-3 max-w-md text-base leading-relaxed text-snow/70">
                You&apos;ll get one link to share in your group chat.
              </p>
            </div>

            <div className="mt-8 lg:mt-0 lg:rounded-3xl lg:bg-white lg:p-8 lg:text-ink lg:shadow-2xl">
              <CreateFamilyForm defaultMemberName={viewer?.member.displayName} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
