import type { Metadata } from 'next';
import Link from 'next/link';
import { requireViewer } from '@/lib/session';
import { listMyClaims, listMyNotices } from '@/lib/db/claims';
import { formatPrice, preferenceChips } from '@/lib/format';
import { PageHeaderBand } from '@/app/_components/PageHeaderBand';
import { Bauble } from '@/app/_components/Bauble';
import { SecretGiftActions } from '@/app/_components/SecretGiftActions';
import { DismissNoticeButton } from '@/app/_components/DismissNoticeButton';
import { StaggerItem, StaggerList } from '@/app/_components/motion';
import { AlertCircleIcon, LockIcon } from '@/app/_components/icons';

export const metadata: Metadata = {
  title: 'My Secret Gifts',
  robots: { index: false, follow: false },
};

function StatusPill({ status }: { status: 'reserved' | 'purchased' }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        status === 'purchased'
          ? 'bg-pine-100 text-pine-700'
          : 'bg-gold-100 text-gold-ink'
      }`}
    >
      {status === 'purchased' ? 'Purchased' : 'Reserved'}
    </span>
  );
}

function giftSummary(preferences: string | null, description: string | null): string | null {
  const chips = preferenceChips(preferences);
  if (chips.length > 0) {
    return chips.join(' · ');
  }

  return description;
}

export default async function SecretGiftsPage() {
  const viewer = await requireViewer();
  const [claims, notices] = await Promise.all([
    listMyClaims(viewer.member.id),
    listMyNotices(viewer.member.id),
  ]);
  const reservedCount = claims.filter((claim) => claim.status === 'reserved').length;
  const purchasedCount = claims.filter((claim) => claim.status === 'purchased').length;
  const countCopy = `${reservedCount} reserved · ${purchasedCount} purchased`;

  return (
    <main id="main">
      <PageHeaderBand
        title="My Secret Gifts"
        subtitle={`${countCopy} · only you can see this`}
        action={
          <>
            <div className="hidden items-center gap-2 lg:flex">
              <span className="rounded-full bg-gold-100 px-4 py-2 text-sm font-bold text-gold-ink">
                {reservedCount} reserved
              </span>
              <span className="rounded-full bg-pine-100 px-4 py-2 text-sm font-bold text-pine-700">
                {purchasedCount} purchased
              </span>
            </div>
          </>
        }
      />

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 lg:px-6 lg:py-8">
        {notices.length > 0 ? (
          <section aria-label="Notices" className="mb-5 space-y-2">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="flex items-start gap-3 rounded-2xl bg-gold-100 px-4 py-3 text-gold-ink"
              >
                <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="flex-1 text-sm leading-relaxed">{notice.message}</p>
                <DismissNoticeButton noticeId={notice.id} />
              </div>
            ))}
          </section>
        ) : null}

        {claims.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center sm:py-24">
            <span className="inline-flex h-20 w-20 items-center justify-center rounded-[24px] bg-gold-100 text-gold-ink">
              <LockIcon className="h-9 w-9" />
            </span>
            <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">
              No secret gifts yet
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Pick a number on someone&apos;s list, then claim the gift you love. It will wait
              here, just for you.
            </p>
            <Link
              href="/family"
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-6 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              Pick a Gift
            </Link>
          </div>
        ) : (
          <>
            <StaggerList className="space-y-4 lg:hidden">
              {claims.map((claim) => {
                const price = formatPrice(claim.gift.pricePence);
                const summary = giftSummary(claim.gift.preferences, claim.gift.description);

                return (
                  <StaggerItem
                    key={claim.id}
                    data-claim-item
                    className="rounded-2xl border border-pine-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <Bauble name={claim.recipientName} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-extrabold text-ink">
                              {claim.gift.name}
                            </h2>
                            <p className="mt-0.5 text-sm text-muted">
                              For {claim.recipientName}
                              {summary ? ` · ${summary}` : ''}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            {price ? (
                              <span className="text-base font-extrabold text-pine-700">
                                {price}
                              </span>
                            ) : null}
                            <StatusPill status={claim.status} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-pine-100 pt-4">
                      <SecretGiftActions
                        claimId={claim.id}
                        status={claim.status}
                        recipientName={claim.recipientName}
                        gift={claim.gift}
                        layout="mobile"
                      />
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerList>

            <div className="hidden overflow-hidden rounded-2xl border border-pine-100 bg-white shadow-sm lg:block">
              <table className="w-full text-left">
                <caption className="sr-only">Gifts you have secretly claimed</caption>
                <thead className="border-b border-pine-100 text-sm font-semibold text-muted">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      For
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Gift
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Price
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <StaggerList as="tbody" className="divide-y divide-pine-100">
                  {claims.map((claim) => {
                    const price = formatPrice(claim.gift.pricePence);
                    const summary = giftSummary(
                      claim.gift.preferences,
                      claim.gift.description,
                    );

                    return (
                      <StaggerItem
                        key={claim.id}
                        as="tr"
                        data-claim-item
                        className="align-middle"
                      >
                        <th scope="row" className="px-5 py-4 text-left">
                          <span className="flex items-center gap-2">
                            <Bauble name={claim.recipientName} />
                            <span className="text-sm font-bold text-ink">
                              {claim.recipientName}
                            </span>
                          </span>
                        </th>
                        <td className="max-w-[18rem] px-5 py-4">
                          <p className="text-sm font-bold text-ink">{claim.gift.name}</p>
                          {summary ? (
                            <p className="mt-0.5 text-xs text-muted">{summary}</p>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm font-extrabold text-pine-700">
                          {price ?? '—'}
                        </td>
                        <td className="px-5 py-4">
                          <StatusPill status={claim.status} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <SecretGiftActions
                              claimId={claim.id}
                              status={claim.status}
                              recipientName={claim.recipientName}
                              gift={claim.gift}
                              layout="desktop"
                            />
                          </div>
                        </td>
                      </StaggerItem>
                    );
                  })}
                </StaggerList>
              </table>
            </div>
          </>
        )}

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted">
          <LockIcon className="h-4 w-4" />
          The recipient never sees this page, not even a hint.
        </p>
      </div>
    </main>
  );
}
