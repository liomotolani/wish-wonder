import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@/app/_components/icons';
import { GiftForm } from '@/app/_components/GiftForm';
import { getOwnGift } from '@/lib/db/gifts';
import { getManagedMember } from '@/lib/db/members';
import { getViewer, requireViewer } from '@/lib/session';

interface EditManagedGiftPageProps {
  params: Promise<{ memberId: string; giftId: string }>;
}

export async function generateMetadata({
  params,
}: EditManagedGiftPageProps): Promise<Metadata> {
  const viewer = await getViewer();
  const { memberId, giftId } = await params;

  if (!viewer || !viewer.event) {
    return { title: 'Edit a gift', robots: { index: false, follow: false } };
  }

  const managed = await getManagedMember(
    memberId,
    viewer.member.id,
    viewer.family.id,
  );

  if (!managed) {
    return { title: 'Edit a gift', robots: { index: false, follow: false } };
  }

  const gift = await getOwnGift(giftId, managed.id, viewer.event.id);

  return {
    title: gift ? `Edit ${gift.name}` : 'Edit a gift',
    robots: { index: false, follow: false },
  };
}

export default async function EditManagedGiftPage({
  params,
}: EditManagedGiftPageProps) {
  const viewer = await requireViewer();
  const { memberId, giftId } = await params;

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

  const gift = await getOwnGift(giftId, managed.id, viewer.event.id);

  if (!gift) {
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
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink">
              Edit {managed.displayName}&apos;s gift
            </h1>
            <p className="truncate text-sm text-muted">{gift.name}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-pine-100 bg-white p-5 shadow-sm sm:p-7">
          <GiftForm
            gift={gift}
            ownerMemberId={managed.id}
            ownerName={managed.displayName}
            returnHref={returnHref}
          />
        </div>
      </div>
    </main>
  );
}
