import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getViewer, requireViewer } from '@/lib/session';
import {
  getOrCreatePickerVisit,
  getPickerGridView,
  getPickerListView,
  getPickerRecipient,
} from '@/lib/db/picker';
import { Bauble } from '@/app/_components/Bauble';
import { MysteryTile } from '@/app/_components/MysteryTile';
import { PickerAutoRefresh } from '@/app/_components/PickerAutoRefresh';
import { PickerViewSwitch } from '@/app/_components/PickerViewSwitch';
import { ListBuyButton } from '@/app/_components/ListBuyButton';
import { GiftThumbnail } from '@/app/_components/GiftThumbnail';
import { NoActiveEventNotice } from '@/app/_components/NoActiveEventNotice';
import { Snowfall } from '@/app/_components/motion';
import { formatPrice } from '@/lib/format';
import {
  ChevronLeftIcon,
  CheckIcon,
  EyeIcon,
  LockIcon,
  StarIcon,
} from '@/app/_components/icons';

interface PickerPageProps {
  params: Promise<{ memberId: string }>;
  searchParams: Promise<{ visit?: string | string[]; view?: string | string[] }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ memberId: string }>;
}): Promise<Metadata> {
  const viewer = await getViewer();

  if (!viewer || !viewer.event) {
    return { title: 'Pick a number', robots: { index: false, follow: false } };
  }

  const { memberId } = await params;
  const recipient = await getPickerRecipient(memberId, viewer.family.id);

  return {
    title: recipient ? `Pick a number for ${recipient.displayName}` : 'Pick a number',
    robots: { index: false, follow: false },
  };
}

export default async function PickerPage({ params, searchParams }: PickerPageProps) {
  const viewer = await requireViewer();
  const { memberId } = await params;
  const search = await searchParams;
  const visitParam = typeof search.visit === 'string' ? search.visit : undefined;
  const viewParam = typeof search.view === 'string' ? search.view : undefined;

  if (!viewer.event) {
    return (
      <div className="theme-dark min-h-screen bg-pine-900 text-snow">
        <div className="snow-dots min-h-screen">
          <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6 sm:px-8 sm:py-10">
            <Link
              href="/family"
              aria-label="Back to Home"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-snow/10 text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </Link>
            <main id="main" className="flex flex-1 flex-col justify-center py-10">
              <h1 className="sr-only">Pick a gift</h1>
              <NoActiveEventNotice
                tone="dark"
                canManage={viewer.family.organiserMemberId === viewer.member.id}
              />
            </main>
          </div>
        </div>
      </div>
    );
  }

  const recipient = await getPickerRecipient(memberId, viewer.family.id);

  if (!recipient) {
    notFound();
  }

  if (recipient.id === viewer.member.id) {
    return (
      <div className="theme-dark flex min-h-screen flex-col items-center justify-center bg-pine-900 px-5 text-center text-snow">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-[20px] bg-snow/10 text-gold">
          <LockIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight">That&apos;s your own list</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-snow/65">
          Pick someone else from the Home page.
        </p>
        <Link
          href="/family"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-6 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const visit = await getOrCreatePickerVisit({
    buyerMemberId: viewer.member.id,
    recipient,
    familyId: viewer.family.id,
    visitId: visitParam,
  });

  if (!visit) {
    notFound();
  }

  const boxesEnabled = viewer.family.mysteryBoxes;
  const wantsList = !boxesEnabled || viewParam === 'list';
  const canonical = new URLSearchParams({ visit: visit.id });

  if (wantsList) {
    canonical.set('view', 'list');
  } else if (viewParam === 'boxes') {
    canonical.set('view', 'boxes');
  }

  // Keep the visit and view in the URL so refresh, links and the back button
  // land on the same board.
  if (
    visitParam !== visit.id ||
    (wantsList && viewParam !== 'list') ||
    (!wantsList && viewParam !== undefined && viewParam !== 'boxes')
  ) {
    redirect(`/pick/${recipient.id}?${canonical.toString()}`);
  }

  const list = wantsList
    ? await getPickerListView(recipient.id, viewer.event.id)
    : null;
  const grid = wantsList ? null : await getPickerGridView(visit, viewer.event.id);
  const active = list ?? grid;

  if (!active) {
    notFound();
  }

  const allTaken = active.totalCount > 0 && active.availableCount === 0;
  const boxesHref = `/pick/${recipient.id}?${new URLSearchParams({
    visit: visit.id,
    view: 'boxes',
  }).toString()}`;
  const listHref = `/pick/${recipient.id}?${new URLSearchParams({
    visit: visit.id,
    view: 'list',
  }).toString()}`;
  const hasExplicitView = viewParam === 'boxes' || viewParam === 'list';

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <PickerAutoRefresh
        memberId={recipient.id}
        initialTotal={active.totalCount}
        initialAvailable={active.availableCount}
      />
      <div className="snow-dots relative isolate min-h-screen">
        <Snowfall />
        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-8 pt-6 sm:px-8 lg:px-6 lg:pt-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 lg:hidden">
            <Link
              href="/family"
              aria-label="Back to Home"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-snow/10 text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </Link>
            <span className="inline-flex min-h-12 items-center justify-center gap-2 justify-self-center rounded-full bg-snow/10 py-1 pl-1 pr-5">
              <Bauble name={recipient.displayName} className="scale-90" />
              <span className="text-sm font-bold text-snow">Buying for {recipient.displayName}</span>
            </span>
            <span aria-hidden="true" />
          </div>

          <main id="main" className="flex-1 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-12 lg:pt-6">
            <div className="max-w-xl lg:sticky lg:top-8">
              <Link
                href="/family"
                className="hidden min-h-11 items-center gap-1 text-sm font-bold text-snow/65 hover:text-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:inline-flex"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Back to Home
              </Link>

              <span className="mt-5 hidden min-h-12 w-fit items-center gap-2 rounded-full bg-snow/10 py-1 pl-1 pr-5 lg:flex">
                <Bauble name={recipient.displayName} className="scale-90" />
                <span className="text-sm font-bold text-snow">
                  Buying for {recipient.displayName}
                </span>
              </span>

              <h1 className="mt-6 text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] sm:text-6xl">
                {wantsList ? (
                  <>
                    {recipient.displayName}&apos;s{' '}
                    <span className="text-gold">wishes</span>
                  </>
                ) : (
                  <>
                    Pick a <span className="text-gold">number</span>
                  </>
                )}
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-snow/70">
                {wantsList
                  ? `Everything on ${recipient.displayName}'s list. Buy one when you're sure, and nobody else can pick it.`
                  : `Each box hides a wish from ${recipient.displayName}'s list. You can see the price, the gift is a surprise.`}
              </p>

              <div className="mt-6">
                <PickerViewSwitch
                  view={wantsList ? 'list' : 'boxes'}
                  boxesHref={boxesHref}
                  listHref={listHref}
                  hasExplicitView={hasExplicitView}
                  enabled={boxesEnabled}
                />
              </div>

              {wantsList ? null : (
                <div className="mt-6 hidden items-center gap-4 text-xs font-semibold text-snow/60 lg:flex">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded-[4px] bg-cranberry" />
                    Mystery
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded-[4px] border border-gold/70" />
                    Peeked
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 rounded-[4px] border border-dashed border-snow/30" />
                    Taken
                  </span>
                </div>
              )}
            </div>

            <div className="mt-8 lg:mt-0">
              {active.totalCount === 0 ? (
                <div className="rounded-3xl border border-snow/15 bg-snow/[0.06] p-6 sm:p-8">
                  <h2 className="text-2xl font-extrabold tracking-tight">
                    No gifts on {recipient.displayName}&apos;s list yet
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-snow/65">
                    There&apos;s nothing to pick from right now. Check back later in case they add
                    more.
                  </p>
                  <Link
                    href="/family"
                    className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-6 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    Buy for someone else
                  </Link>
                </div>
              ) : wantsList && list ? (
                <>
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-sm text-snow/65">
                      {list.availableCount} of {list.totalCount} still available
                    </p>
                    <p className="text-sm font-semibold text-gold">
                      Sort: price low to high
                    </p>
                  </div>

                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {list.items.map((gift) => {
                      const price = formatPrice(gift.pricePence, gift.currency);

                      return (
                        <li
                          key={gift.id}
                          className={`flex items-center gap-3 rounded-2xl border p-3 ${
                            gift.taken
                              ? 'border-dashed border-snow/25 bg-pine-900/30 opacity-60'
                              : 'border-snow/15 bg-snow/[0.06]'
                          }`}
                        >
                          <GiftThumbnail
                            giftId={gift.id}
                            imageUrl={gift.imageUrl}
                            className="h-16 w-16"
                          />
                          <div className="min-w-0 flex-1">
                            <p
                              className={`line-clamp-2 text-base font-extrabold leading-snug ${
                                gift.taken ? 'text-snow/60' : 'text-snow'
                              }`}
                            >
                              {gift.name}
                            </p>
                            <p className="mt-0.5 text-sm text-snow/60">
                              {price ?? 'No price'}
                              {gift.shopName ? ` · ${gift.shopName}` : ''}
                            </p>
                            {gift.priority ? (
                              <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-gold">
                                <StarIcon className="h-3 w-3" />
                                Really wants this
                              </p>
                            ) : null}
                          </div>

                          {gift.taken ? (
                            <span className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-dashed border-snow/30 px-3 text-sm font-semibold text-snow/60">
                              <CheckIcon className="h-4 w-4" />
                              Taken
                            </span>
                          ) : (
                            <ListBuyButton giftId={gift.id} shopUrl={gift.shopUrl} />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : grid ? (
                <>
                  {allTaken ? (
                    <div className="mb-5 rounded-2xl border border-gold/40 bg-gold/10 p-5 sm:p-6">
                      <h2 className="text-xl font-extrabold tracking-tight text-gold sm:text-2xl">
                        Every gift has been picked
                      </h2>
                      <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-snow/75">
                        There are no gifts left to choose on {recipient.displayName}&apos;s list
                        right now. Check back later in case they add more.
                      </p>
                    </div>
                  ) : null}

                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {grid.boxes.map((box) => (
                      <li key={box.number}>
                        <MysteryTile
                          number={box.number}
                          state={box.state}
                          pricePence={box.pricePence}
                          currency={box.currency}
                          visitId={visit.id}
                          href={
                            box.state === 'taken'
                              ? undefined
                              : `/pick/${recipient.id}/reveal/${box.number}?visit=${visit.id}`
                          }
                        />
                      </li>
                    ))}
                  </ul>

                  {allTaken ? (
                    <Link
                      href="/family"
                      className="mt-6 flex min-h-14 w-full items-center justify-center rounded-full border border-snow/25 px-6 text-base font-bold text-snow transition-colors hover:bg-snow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:hidden"
                    >
                      Buy for someone else
                    </Link>
                  ) : (
                    <p className="mt-6 flex items-center justify-center gap-2 text-xs text-snow/60 lg:justify-start">
                      <EyeIcon className="h-4 w-4" />
                      Peeking never reserves a gift. Claim it only when you&apos;re sure.
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
