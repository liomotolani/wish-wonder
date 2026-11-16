import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeftIcon } from '@/app/_components/icons';
import { CreateFamilyForm } from '@/app/_components/CreateFamilyForm';

export const metadata: Metadata = {
  title: 'Create your family space',
  robots: { index: false, follow: false },
};

export default function CreateFamilyPage() {
  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6 sm:px-8 sm:py-10">
          <Link
            href="/"
            aria-label="Back to the welcome page"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-snow/10 text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>

          <main id="main" className="flex flex-1 flex-col pt-8 sm:pt-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">Step 1 of 2</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Create your family space
            </h1>
            <p className="mt-3 text-base leading-relaxed text-snow/70">
              You&apos;ll get one link to share in your family chat.
            </p>

            <div className="mt-8 flex-1">
              <CreateFamilyForm />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
