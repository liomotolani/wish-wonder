import type { Metadata } from 'next';
import Link from 'next/link';
import { requireViewer } from '@/lib/session';
import { listOwnGifts } from '@/lib/db/gifts';
import { listManagedMembers } from '@/lib/db/members';
import { PageHeaderBand } from '@/app/_components/PageHeaderBand';
import { WishlistTabs } from '@/app/_components/WishlistTabs';
import { WishlistGiftGrid } from '@/app/_components/WishlistGiftGrid';
import { NoActiveEventNotice } from '@/app/_components/NoActiveEventNotice';
import { groupWording } from '@/lib/groupWording';
import { PlusIcon } from '@/app/_components/icons';

export const metadata: Metadata = {
  title: 'My Wishlist',
  robots: { index: false, follow: false },
};

const ADD_BUTTON_CLASS =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cranberry px-5 text-sm font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';

export default async function WishlistPage() {
  const viewer = await requireViewer();
  const [gifts, managedMembers] = await Promise.all([
    viewer.event ? listOwnGifts(viewer.member.id, viewer.event.id) : Promise.resolve([]),
    listManagedMembers(viewer.member.id, viewer.family.id),
  ]);
  const countLabel = gifts.length === 1 ? '1 wish' : `${gifts.length} wishes`;
  const eventName = viewer.event?.name ?? 'This Christmas';
  const isOrganiser = viewer.family.organiserMemberId === viewer.member.id;
  const wording = groupWording(viewer.family.groupType);

  if (!viewer.event) {
    return (
      <main id="main">
        <PageHeaderBand
          title="My Wishlist"
          subtitle="No active Christmas event"
          eyebrow={<WishlistTabs managedMembers={managedMembers} activeMemberId={null} />}
        />
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-6 lg:py-8">
          <NoActiveEventNotice canManage={isOrganiser} />
        </div>
      </main>
    );
  }

  return (
    <main id="main">
      <PageHeaderBand
        title="My Wishlist"
        subtitle={`${gifts.length === 0 ? 'No wishes yet' : countLabel} · ${eventName}`}
        eyebrow={<WishlistTabs managedMembers={managedMembers} activeMemberId={null} />}
        action={
          <Link
            href="/wishlist/new"
            aria-label="Add a gift"
            className="inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-cranberry px-0 text-sm font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:w-auto sm:px-5"
          >
            <PlusIcon className="h-6 w-6 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Add a gift</span>
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-6 lg:py-8">
        {gifts.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center sm:py-24">
            <div className="relative h-32 w-40" aria-hidden="true">
              <span className="absolute left-2 top-8 h-24 w-28 rotate-[-12deg] rounded-[26px] bg-pine-100" />
              <span className="absolute right-1 top-0 flex h-28 w-28 rotate-[8deg] items-center justify-center rounded-[26px] bg-cranberry text-4xl font-extrabold text-white shadow-lg">
                ?
              </span>
            </div>
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">
              Your list is empty
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Add the gifts you&apos;d love so your {wording.groupWord} can surprise you with
              something you really want.
            </p>
            <Link href="/wishlist/new" className={`${ADD_BUTTON_CLASS} mt-6`}>
              <PlusIcon className="h-5 w-5" />
              Add your first gift
            </Link>
          </div>
        ) : (
          <WishlistGiftGrid gifts={gifts} editHref={(giftId) => `/wishlist/${giftId}`} />
        )}
      </div>
    </main>
  );
}
