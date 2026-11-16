'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, preferenceChips } from '@/lib/format';
import { mysteryToneFor } from '@/lib/mystery-tone';
import type { RevealedGiftView } from '@/lib/types';
import { PRIORITY_REALLY_WANT } from '@/lib/validation';
import { Bauble } from '@/app/_components/Bauble';
import { ClaimGiftButton } from '@/app/_components/ClaimGiftButton';
import { GiftPlaceholder } from '@/app/_components/GiftPlaceholder';
import { RevealScene, Snowfall } from '@/app/_components/motion';
import { preloadClaimConfetti } from '@/app/_components/motion/celebration';
import {
  fetchReveal,
  type RevealResponse,
} from '@/app/_components/reveal-cache';
import {
  ChevronLeftIcon,
  ClockIcon,
  CloseIcon,
  ExternalLinkIcon,
  GiftIcon,
  StarIcon,
} from '@/app/_components/icons';

interface RevealExperienceProps {
  memberId: string;
  number: number;
  visitId: string;
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
      <p className="justify-self-center text-sm font-semibold text-snow/80">
        For {displayName}
      </p>
      <span aria-hidden="true" />
    </div>
  );
}

function RevealGiftCard({
  gift,
  number,
  recipientName,
  visitId,
  backHref,
}: {
  gift: RevealedGiftView;
  number: number;
  recipientName: string;
  visitId: string;
  backHref: string;
}) {
  const price = formatPrice(gift.pricePence);
  const chips = preferenceChips(gift.preferences);
  const isPriority = gift.priority === PRIORITY_REALLY_WANT;

  return (
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
          <GiftPlaceholder />
        )}
        <span className="absolute left-4 top-4 flex h-16 w-16 items-end justify-center rounded-2xl bg-cranberry p-2 text-2xl font-extrabold text-white shadow-lg">
          {number}
        </span>
      </div>

      <div className="p-5 sm:p-6 lg:flex lg:flex-col lg:p-3">
        <div className="flex items-start justify-between gap-3">
          <p className="hidden text-[11px] font-bold uppercase tracking-[0.16em] text-cranberry-ink lg:block">
            Mystery gift revealed · For {recipientName}
          </p>
          <Link
            href={backHref}
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
            <GiftPlaceholder />
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
            recipientName={recipientName}
            visitId={visitId}
            number={number}
            backHref={backHref}
          />
        </div>

        <div className="mt-4 hidden items-center gap-2 text-xs text-muted lg:flex">
          <Bauble name={recipientName} className="scale-75" />
          {recipientName} can&apos;t see this page.
        </div>
      </div>
    </div>
  );
}

function LoadingBox({ number }: { number: number }) {
  const tone = mysteryToneFor(number);

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="relative mx-auto h-56 w-56 sm:h-64 sm:w-64" aria-hidden="true">
        <span className="reveal-glow-surface absolute inset-[8%] rounded-full opacity-50" />
        <span className="absolute inset-[12%] rounded-full border border-gold/40" />
        <div
          className={`absolute bottom-4 left-1/2 flex h-32 w-32 -translate-x-1/2 items-end justify-center rounded-[24px] ${tone.box} shadow-[0_24px_50px_rgba(0,0,0,0.35)]`}
        >
          <span className={`absolute inset-y-0 left-1/2 w-2.5 ${tone.ribbon}`} />
          <span className={`absolute inset-x-0 top-[34%] h-2.5 ${tone.ribbon}`} />
          <span className={`mb-3 text-5xl font-extrabold ${tone.number}`}>{number}</span>
        </div>
      </div>
    </div>
  );
}

function ErrorState({
  response,
  backHref,
  onRetry,
}: {
  response: RevealResponse;
  backHref: string;
  onRetry: () => void;
}) {
  if (response.reason === 'rate_limited') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-[22px] bg-snow/10 text-gold">
          <ClockIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">Slow down a moment</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-snow/65">
          You&apos;ve peeked at a lot of numbers. Take a little breather, then try again in a
          minute.
        </p>
        <Link
          href={backHref}
          className="mt-7 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-full bg-cranberry px-6 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Back to the picker
        </Link>
      </div>
    );
  }

  if (response.reason === 'taken') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center py-12">
        <div className="flex h-28 w-28 items-center justify-center rounded-[24px] border-2 border-dashed border-snow/25 text-4xl font-extrabold text-snow/55">
          Taken
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">This box is now Taken</h1>
        <p className="mt-2 max-w-sm text-center text-sm leading-relaxed text-snow/65">
          Someone claimed this gift. There are plenty more numbers to try.
        </p>
        <Link
          href={backHref}
          className="mt-7 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-full bg-cranberry px-6 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Try Another Number
        </Link>
      </div>
    );
  }

  if (response.reason === 'error') {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center">
        <span className="inline-flex h-20 w-20 items-center justify-center rounded-[22px] bg-snow/10 text-gold">
          <GiftIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">That box did not open</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-snow/65">
          {response.error ?? 'Please try again.'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-7 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-full bg-cranberry px-6 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-12 text-center">
      <span className="inline-flex h-20 w-20 items-center justify-center rounded-[22px] bg-snow/10 text-gold">
        <GiftIcon className="h-9 w-9" />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold tracking-tight">Start again from the picker</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-snow/65">
        That picker has expired. Head back to the family page and open a fresh set of numbers.
      </p>
      <Link
        href="/family"
        className="mt-7 inline-flex min-h-14 w-full max-w-sm items-center justify-center rounded-full bg-cranberry px-6 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        Back to family
      </Link>
    </div>
  );
}

/**
 * Loads one revealed gift and plays the reveal as soon as the data is ready.
 * The picker starts the request on tap, so on the normal path this screen has
 * the gift before the lid comes off; a direct visit falls back to its own call.
 */
export function RevealExperience({ memberId, number, visitId }: RevealExperienceProps) {
  const [response, setResponse] = useState<RevealResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const backHref = `/pick/${memberId}?visit=${visitId}`;

  useEffect(() => {
    let active = true;
    preloadClaimConfetti();

    void fetchReveal(visitId, number).then((result) => {
      if (!active) {
        return;
      }

      setResponse(result);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [number, visitId]);

  function retry() {
    setLoading(true);
    setResponse(null);
    void fetchReveal(visitId, number).then((result) => {
      setResponse(result);
      setLoading(false);
    });
  }

  const displayName = response?.recipientName ?? 'your family member';

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="relative isolate min-h-screen overflow-hidden">
        <span className="snow-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <Snowfall />

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-6 pt-6 sm:px-8 lg:px-6 lg:pb-12 lg:pt-8">
          <RevealTopBar backHref={backHref} displayName={displayName} />

          <main id="main" className="pt-8 lg:pt-6">
            {loading ? (
              <LoadingBox number={number} />
            ) : response?.ok && response.gift ? (
              <RevealScene number={number}>
                <RevealGiftCard
                  gift={response.gift}
                  number={number}
                  recipientName={response.recipientName ?? 'your family member'}
                  visitId={visitId}
                  backHref={backHref}
                />
              </RevealScene>
            ) : response ? (
              <ErrorState response={response} backHref={backHref} onRetry={retry} />
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
