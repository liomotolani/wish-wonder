import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireViewer } from '@/lib/session';
import {
  getPickerGiftDetail,
  getPickerRecipient,
} from '@/lib/db/picker';
import { RevealGiftCard } from '@/app/_components/RevealExperience';
import { Snowfall } from '@/app/_components/motion';
import { ChevronLeftIcon } from '@/app/_components/icons';

export const metadata: Metadata = {
  title: 'Gift details',
  robots: { index: false, follow: false },
};

interface GiftPageProps {
  params: Promise<{ memberId: string; giftId: string }>;
  searchParams: Promise<{ visit?: string | string[] }>;
}

export default async function PickerGiftPage({ params, searchParams }: GiftPageProps) {
  const viewer = await requireViewer();

  if (!viewer.event) {
    notFound();
  }

  const { memberId, giftId } = await params;
  const search = await searchParams;
  const visitId = typeof search.visit === 'string' ? search.visit : undefined;
  const recipient = await getPickerRecipient(memberId, viewer.family.id);

  if (!recipient || recipient.id === viewer.member.id) {
    notFound();
  }

  const gift = await getPickerGiftDetail(giftId, recipient.id, viewer.event.id);

  if (!gift) {
    notFound();
  }

  const backParams = new URLSearchParams({ view: 'list' });
  if (visitId) {
    backParams.set('visit', visitId);
  }
  const backHref = `/pick/${recipient.id}?${backParams.toString()}`;

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots relative isolate min-h-screen">
        <Snowfall />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 pt-6 sm:px-8 lg:px-6 lg:pt-8">
          <Link
            href={backHref}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-snow/65 hover:text-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to list
          </Link>

          <main id="main" className="flex justify-center pt-6 lg:pt-10">
            <RevealGiftCard
              gift={gift}
              giftId={giftId}
              recipientName={recipient.displayName}
              backHref={backHref}
              backLabel="Back to list"
            />
          </main>
        </div>
      </div>
    </div>
  );
}
