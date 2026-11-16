import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ChevronLeftIcon } from '@/app/_components/icons';
import { GiftForm } from '@/app/_components/GiftForm';
import { getOwnGift } from '@/lib/db/gifts';
import { getViewer, requireViewer } from '@/lib/session';

interface EditGiftPageProps {
  params: Promise<{ giftId: string }>;
}

export async function generateMetadata({
  params,
}: EditGiftPageProps): Promise<Metadata> {
  const viewer = await getViewer();
  const { giftId } = await params;

  if (!viewer || !viewer.event) {
    return { title: 'Edit a gift', robots: { index: false, follow: false } };
  }

  const gift = await getOwnGift(giftId, viewer.member.id, viewer.event.id);

  return {
    title: gift ? `Edit ${gift.name}` : 'Edit a gift',
    robots: { index: false, follow: false },
  };
}

export default async function EditGiftPage({ params }: EditGiftPageProps) {
  const viewer = await requireViewer();
  const { giftId } = await params;

  if (!viewer.event) {
    redirect('/wishlist');
  }

  const gift = await getOwnGift(giftId, viewer.member.id, viewer.event.id);

  if (!gift) {
    notFound();
  }

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
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-ink">
              Edit gift
            </h1>
            <p className="truncate text-sm text-muted">{gift.name}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-pine-100 bg-white p-5 shadow-sm sm:p-7">
          <GiftForm gift={gift} />
        </div>
      </div>
    </main>
  );
}
