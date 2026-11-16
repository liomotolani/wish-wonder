import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getViewer, requireViewer } from '@/lib/session';
import {
  getPickerRecipient,
  getPickerVisitById,
  getReveal,
} from '@/lib/db/picker';
import { formatPrice, preferenceChips } from '@/lib/format';
import { PRIORITY_REALLY_WANT } from '@/lib/validation';
import { Bauble } from '@/app/_components/Bauble';
import { ClaimGiftButton } from '@/app/_components/ClaimGiftButton';
import { RevealScene, Snowfall } from '@/app/_components/motion';
import {
  ChevronLeftIcon,
  ClockIcon,
  CloseIcon,
  ExternalLinkIcon,
  GiftIcon,
  StarIcon,
} from '@/app/_components/icons';

interface RevealPageProps {
  params: Promise<{ memberId: string; number: string }>;
  searchParams: Promise<{ visit?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ memberId: string; number: string }>;
}): Promise<Metadata> {
  const viewer = await getViewer();

  if (!viewer) {
    return { title: 'Mystery gift', robots: { index: false, follow: false } };
  }

  const { memberId } = await params;
  const recipient = await getPickerRecipient(memberId, viewer.family.id);

  return {
    title: recipient ? `Mystery gift for ${recipient.displayName}` : 'Mystery gift',
    robots: { index: false, follow: false },
  };
}

function RevealTopBar({
  backHref,
  displayName,
}: {
  backHref: string;
  displayName: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <Link
        href={backHref}
        aria-label="Back to the mystery numbers"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-snow/10 text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </Link>
      <p className="justify-self-center text-sm font-semibold text-snow/80">For {displayName}</p>
      <span aria-hidden="true" />
    </div>
  );
}

export default async function RevealPage({ params, searchParams }: RevealPageProps) {
  const viewer = await requireViewer();
  const { memberId, number: numberParam } = await params;
  const search = await searchParams;
  const visitId = typeof search.visit === 'string' ? search.visit : '';
  const number = Number(numberParam);

  if (!viewer.event) {
    redirect('/family');
  }

  if (!Number.isInteger(number) || number < 1 || number > 500) {
    notFound();
  }

  const recipient = await getPickerRecipient(memberId, viewer.family.id);

  if (!recipient || recipient.id === viewer.member.id) {
    notFound();
  }

  if (!visitId) {
    redirect(`/pick/${recipient.id}`);
  }

  const visit = await getPickerVisitById(visitId, viewer.member.id, recipient.id);

  if (!visit) {
    redirect(`/pick/${recipient.id}`);
  }

  const visitWithName = { ...visit, recipientName: recipient.displayName };
  const result = await getReveal(visitWithName, viewer.event.id, number);
  const pickerHref = `/pick/${recipient.id}?visit=${visit.id}`;

  if (!result.ok && result.reason === 'not_found') {
    notFound();
  }

  if (!result.ok && result.reason === 'rate_limited') {
    return (
      <div className="theme-dark min-h-screen bg-pine-900 text-snow">
        <div className="snow-dots relative isolate min-h-screen">
          <Snowfall />
          <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6 sm:px-8 sm:py-10">
            <RevealTopBar backHref={pickerHref} displayName={recipient.displayName} />
            <main id="main" className="flex flex-1 flex-col items-center justify-center py-12 text-center">
              <span className="inline-flex h-20 w-20 items-center justify-center rounded-[22px] bg-snow/10 text-gold">
                <ClockIcon className="h-9 w-9" />
              </span>
              <h1 className="mt-6 text-3xl font-extrabold tracking-tight">
                Slow down a moment
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-snow/65">
                You&apos;ve peeked at a lot of numbers. Take a little breather, then try again
                in a minute.
              </p>
              <Link
                href={pickerHref}
                className="mt-7 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-full bg-cranberry px-6 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Back to the picker
              </Link>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (!result.ok) {
    return (
      <div className="theme-dark min-h-screen bg-pine-900 text-snow">
        <div className="snow-dots relative isolate min-h-screen">
          <Snowfall />
          <div className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6 sm:px-8 sm:py-10">
            <RevealTopBar backHref={pickerHref} displayName={recipient.displayName} />
            <main id="main" className="flex flex-1 flex-col items-center justify-center py-12">
              <div className="flex h-28 w-28 items-center justify-center rounded-[24px] border-2 border-dashed border-snow/25 text-4xl font-extrabold text-snow/55">
                {number}
              </div>
              <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
                Number {number} is now Taken
              </h1>
              <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-snow/65">
                Someone claimed this gift. There are plenty more numbers to try.
              </p>
              <Link
                href={pickerHref}
                className="mt-7 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-full bg-cranberry px-6 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Try Another Number
              </Link>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const gift = result.gift;
  const price = formatPrice(gift.pricePence);
  const chips = preferenceChips(gift.preferences);
  const isPriority = gift.priority === PRIORITY_REALLY_WANT;

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="relative isolate min-h-screen overflow-hidden">
        <span className="snow-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <Snowfall />

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-6 pt-6 sm:px-8 lg:px-6 lg:pb-12 lg:pt-8">
          <RevealTopBar backHref={pickerHref} displayName={recipient.displayName} />

          <main id="main" className="pt-8 lg:pt-6">
            <RevealScene number={number}>
              <div className="overflow-hidden rounded-[28px] bg-white text-ink shadow-2xl lg:grid lg:w-full lg:max-w-4xl lg:grid-cols-[0.92fr_1.08fr] lg:gap-5 lg:p-5">
                <div className="relative hidden min-h-[380px] overflow-hidden rounded-2xl bg-snow lg:block">
                  {gift.imageUrl ? (
                    <Image
                      src={gift.imageUrl}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 380px, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center text-sm text-muted">
                      <GiftIcon className="mb-2 h-10 w-10 text-pine-700/40" />
                      Product photo
                    </span>
                  )}
                  <span className="absolute left-4 top-4 flex h-16 w-16 items-end justify-center rounded-2xl bg-cranberry p-2 text-2xl font-extrabold text-white shadow-lg">
                    {number}
                  </span>
                </div>

                <div className="p-5 sm:p-6 lg:flex lg:flex-col lg:p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-cranberry-ink lg:block">
                      Mystery gift revealed · For {recipient.displayName}
                    </p>
                    <Link
                      href={pickerHref}
                      aria-label="Close and choose another number"
                      className="ml-auto hidden h-11 w-11 items-center justify-center rounded-full bg-snow text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 lg:inline-flex"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-snow lg:hidden">
                    {gift.imageUrl ? (
                      <Image
                        src={gift.imageUrl}
                        alt=""
                        fill
                        unoptimized
                        sizes="100vw"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full flex-col items-center justify-center text-sm text-muted">
                        <GiftIcon className="mb-2 h-9 w-9 text-pine-700/40" />
                        Product photo
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-3 lg:mt-3">
                    <h2 className="text-2xl font-extrabold leading-tight tracking-tight lg:text-3xl">
                      {gift.name}
                    </h2>
                    {price ? (
                      <span className="shrink-0 text-xl font-extrabold text-pine-700 lg:text-2xl">
                        {price}
                      </span>
                    ) : null}
                  </div>

                  {chips.length > 0 || isPriority ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {chips.map((chip) => (
                        <li
                          key={chip}
                          className="rounded-full bg-snow px-3 py-1 text-sm font-semibold text-ink"
                        >
                          {chip}
                        </li>
                      ))}
                      {isPriority ? (
                        <li className="inline-flex items-center gap-1 rounded-full bg-cranberry/10 px-3 py-1 text-sm font-bold text-cranberry-ink">
                          <StarIcon className="h-3 w-3" />
                          Really want this
                        </li>
                      ) : null}
                    </ul>
                  ) : null}

                  {gift.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted">{gift.description}</p>
                  ) : null}

                  {gift.shopUrl ? (
                    <a
                      href={gift.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex min-h-11 w-fit items-center gap-1.5 text-sm font-bold text-ink underline underline-offset-4 hover:text-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
                    >
                      View product
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </a>
                  ) : null}

                  <div className="mt-5">
                    <ClaimGiftButton
                      recipientName={recipient.displayName}
                      visitId={visit.id}
                      number={number}
                      backHref={pickerHref}
                    />
                  </div>

                  <div className="mt-4 hidden items-center gap-2 text-xs text-muted lg:flex">
                    <Bauble name={recipient.displayName} className="scale-75" />
                    {recipient.displayName} can&apos;t see this page.
                  </div>
                </div>
              </div>
            </RevealScene>
          </main>
        </div>
      </div>
    </div>
  );
}
