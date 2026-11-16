import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@/app/_components/icons';
import { GiftForm } from '@/app/_components/GiftForm';
import { getManagedMember } from '@/lib/db/members';
import { getViewer, requireViewer } from '@/lib/session';

interface NewManagedGiftPageProps {
  params: Promise<{ memberId: string }>;
}

export async function generateMetadata({
  params,
}: NewManagedGiftPageProps): Promise<Metadata> {
  const viewer = await getViewer();
  const { memberId } = await params;

  if (!viewer) {
    return { title: 'Add a gift', robots: { index: false, follow: false } };
  }

  const managed = await getManagedMember(
    memberId,
    viewer.member.id,
    viewer.family.id,
  );

  return {
    title: managed ? `Add a gift for ${managed.displayName}` : 'Add a gift',
    robots: { index: false, follow: false },
  };
}

export default async function NewManagedGiftPage({ params }: NewManagedGiftPageProps) {
  const viewer = await requireViewer();
  const { memberId } = await params;

  if (!viewer.event) {
    redirect('/wishlist');
  }

  const managed = await getManagedMember(
    memberId,
    viewer.member.id,
    viewer.family.id,
  );

  if (!managed) {
    notFound();
  }

  const returnHref = `/wishlist/managed/${managed.id}`;

  return (
    <main id="main" className="min-h-[70vh]">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-8 lg:py-10">
        <div className="mb-6 flex items-center gap-3">
          <Link
            href={returnHref}
            aria-label={`Back to ${managed.displayName}'s wishlist`}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink shadow-sm transition-colors hover:bg-pine-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink">
              Add a gift for {managed.displayName}
            </h1>
            <p className="text-sm text-muted">You manage this list for them.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-pine-100 bg-white p-5 shadow-sm sm:p-7">
          <GiftForm
            ownerMemberId={managed.id}
            ownerName={managed.displayName}
            returnHref={returnHref}
          />
        </div>
      </div>
    </main>
  );
}
