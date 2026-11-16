import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getViewer, requireViewer } from '@/lib/session';
import { listOwnGifts } from '@/lib/db/gifts';
import { getManagedMember, listManagedMembers } from '@/lib/db/members';
import { PageHeaderBand } from '@/app/_components/PageHeaderBand';
import { WishlistTabs } from '@/app/_components/WishlistTabs';
import { WishlistGiftGrid } from '@/app/_components/WishlistGiftGrid';
import { GiftIcon, LockIcon, PlusIcon } from '@/app/_components/icons';

interface ManagedWishlistPageProps {
  params: Promise<{ memberId: string }>;
}

export async function generateMetadata({
  params,
}: ManagedWishlistPageProps): Promise<Metadata> {
  const viewer = await getViewer();
  const { memberId } = await params;

  if (!viewer) {
    return { title: 'A managed wishlist', robots: { index: false, follow: false } };
  }

  const managed = await getManagedMember(
    memberId,
    viewer.member.id,
    viewer.family.id,
  );

  return {
    title: managed ? `${managed.displayName}'s wishlist` : 'A managed wishlist',
    robots: { index: false, follow: false },
  };
}

export default async function ManagedWishlistPage({ params }: ManagedWishlistPageProps) {
  const viewer = await requireViewer();
  const { memberId } = await params;

  if (!viewer.event) {
    redirect('/wishlist');
  }

  const [managed, managedMembers] = await Promise.all([
    getManagedMember(memberId, viewer.member.id, viewer.family.id),
    listManagedMembers(viewer.member.id, viewer.family.id),
  ]);

  if (!managed) {
    notFound();
  }

  const gifts = await listOwnGifts(managed.id, viewer.event.id);
  const countLabel = gifts.length === 1 ? '1 wish' : `${gifts.length} wishes`;
  const returnHref = `/wishlist/managed/${managed.id}`;

  return (
    <main id="main">
      <PageHeaderBand
        title={`${managed.displayName}'s wishlist`}
        subtitle={`${countLabel} · you manage this list`}
        compactTitle
        eyebrow={
          <WishlistTabs managedMembers={managedMembers} activeMemberId={managed.id} />
        }
        action={
          <Link
            href={`${returnHref}/new`}
            aria-label={`Add a gift for ${managed.displayName}`}
            className="inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-cranberry px-0 text-sm font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-auto sm:px-5"
          >
            <PlusIcon className="h-6 w-6 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Add a gift for {managed.displayName}</span>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-6 lg:py-8">
        <p className="mb-5 flex items-start gap-2 rounded-2xl bg-pine-100/80 px-4 py-3 text-sm leading-relaxed text-pine-700">
          <LockIcon className="mt-0.5 h-4 w-4 shrink-0" />
          You add and edit {managed.displayName}&apos;s gifts, but like any list owner you
          won&apos;t see what&apos;s been picked.
        </p>

        {gifts.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-[24px] bg-pine-100 text-pine-700">
              <GiftIcon className="h-9 w-9" />
            </span>
            <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-ink">
              {managed.displayName}&apos;s list is empty
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Add the gifts they would love. They will appear on the family page for everyone
              to choose from.
            </p>
            <Link
              href={`${returnHref}/new`}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-cranberry px-6 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              <PlusIcon className="h-5 w-5" />
              Add {managed.displayName}&apos;s first gift
            </Link>
          </div>
        ) : (
          <WishlistGiftGrid
            gifts={gifts}
            editHref={(giftId) => `${returnHref}/${giftId}`}
          />
        )}

        {gifts.length > 0 ? (
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted">
            <LockIcon className="h-4 w-4" />
            Only you can edit this list. Nobody can see what has been picked.
          </p>
        ) : null}
      </div>
    </main>
  );
}
