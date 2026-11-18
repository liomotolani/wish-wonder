import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeftIcon } from '@/app/_components/icons';
import { AddManagedMemberForm } from '@/app/_components/AddManagedMemberForm';
import { requireViewer } from '@/lib/session';
import { groupWording } from '@/lib/groupWording';

export const metadata: Metadata = {
  title: 'Add someone',
  robots: { index: false, follow: false },
};

export default async function AddPersonPage() {
  const viewer = await requireViewer();
  const wording = groupWording(viewer.family.groupType);

  return (
    <main id="main" className="min-h-[70vh]">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-8 lg:py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href="/wishlist"
            aria-label="Back to my wishlist"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-colors hover:bg-pine-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Add someone to your {wording.groupWord}
            </h1>
            <p className="text-sm text-muted">For a person without a phone.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-pine-100 bg-white p-5 shadow-sm sm:p-7">
          <AddManagedMemberForm />
        </div>
      </div>
    </main>
  );
}
