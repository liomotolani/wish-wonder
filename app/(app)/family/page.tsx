import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getAppBaseUrl, getViewer, requireViewer } from '@/lib/session';
import { daysUntilChristmas } from '@/lib/dates';
import { WELCOME_COOKIE_NAME } from '@/lib/tokens';
import { getDashboardData } from '@/lib/db/dashboard';
import { Bauble } from '@/app/_components/Bauble';
import { ApproveMemberButton } from '@/app/_components/ApproveMemberButton';
import { ShareFamilyLink } from '@/app/_components/CopyButton';
import { NoActiveEventNotice } from '@/app/_components/NoActiveEventNotice';
import { FlipNumber, Snowfall, StaggerItem, StaggerList } from '@/app/_components/motion';
import {
  ArrowRightIcon,
  DeviceIcon,
  GiftIcon,
  LockIcon,
  SettingsIcon,
} from '@/app/_components/icons';

export async function generateMetadata(): Promise<Metadata> {
  const viewer = await getViewer();

  return {
    title: viewer ? viewer.family.name : 'Family',
    robots: { index: false, follow: false },
  };
}

const SHARE_BUTTON_CLASS =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-bold text-pine-900 transition-colors hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold';

export default async function FamilyPage() {
  const viewer = await requireViewer();
  const data = await getDashboardData(viewer);
  const days = daysUntilChristmas();
  const firstVisit =
    (await cookies()).get(WELCOME_COOKIE_NAME)?.value === '1';
  const inviteUrl = `${await getAppBaseUrl()}/join/${viewer.family.inviteCode}`;
  const isOrganiser = viewer.family.organiserMemberId === viewer.member.id;
  const familyLabel =
    viewer.event &&
    !viewer.family.name.toLowerCase().includes(viewer.event.name.toLowerCase())
      ? `${viewer.family.name} · ${viewer.event.name}`
      : viewer.family.name;

  return (
    <main id="main">
      <section className="relative isolate overflow-hidden rounded-b-[28px] bg-pine-900 text-snow lg:mx-auto lg:mt-8 lg:max-w-6xl lg:rounded-[28px]">
        <span
          className="snow-dots pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
        />
        <Snowfall variant="header" />
        <div className="relative px-5 pb-7 pt-8 sm:px-8 lg:px-10 lg:py-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-snow/65">{firstVisit ? 'Welcome' : 'Welcome back'}</p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Hi, {viewer.member.displayName}
              </h1>
            </div>
            <div className="lg:hidden">
              {isOrganiser ? (
                <Link
                  href="/settings"
                  aria-label="Family settings"
                  title="Family settings"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-snow/10 text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <SettingsIcon className="h-5 w-5" />
                </Link>
              ) : null}
            </div>
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gold">
            {familyLabel}
          </p>

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="flex items-end gap-3">
              <FlipNumber
                value={days}
                className="text-6xl font-extrabold leading-none tracking-[-0.05em] text-snow sm:text-7xl"
              />
              <span className="max-w-[9rem] pb-1 text-base leading-tight text-snow/65 sm:text-lg">
                {days === 0 ? 'Christmas Day is here' : 'days until Christmas Day'}
              </span>
            </p>
            <div className="hidden sm:block">
              <div className="flex flex-col items-end gap-1.5">
                <ShareFamilyLink
                  url={inviteUrl}
                  familyName={viewer.family.name}
                  className={SHARE_BUTTON_CLASS}
                />
                <Link
                  href="/device"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2 text-sm font-semibold text-snow/70 hover:text-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <DeviceIcon className="h-4 w-4" />
                  Use on another device
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:hidden">
            <ShareFamilyLink
              url={inviteUrl}
              familyName={viewer.family.name}
              className={`${SHARE_BUTTON_CLASS} w-full`}
            />
            <Link
              href="/device"
              className="mt-2 flex min-h-11 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-snow/70 hover:text-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <DeviceIcon className="h-4 w-4" />
              Use on another device
            </Link>
          </div>
        </div>
      </section>

      {data.pendingMembers.length > 0 ? (
        <section
          aria-labelledby="pending-members-heading"
          className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-8 lg:px-6"
        >
          <div className="rounded-2xl border border-gold/50 bg-gold-100/80 p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2
                  id="pending-members-heading"
                  className="text-base font-extrabold text-ink"
                >
                  {data.pendingMembers.length === 1
                    ? '1 person waiting to join'
                    : `${data.pendingMembers.length} people waiting to join`}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {data.pendingMembers.length === 1
                    ? `${data.pendingMembers[0].displayName} would like to join the family.`
                    : 'Approve them so they can add their wishes and join in.'}
                </p>
              </div>
              {data.pendingMembers.length === 1 ? (
                <ApproveMemberButton
                  memberId={data.pendingMembers[0].id}
                  displayName={data.pendingMembers[0].displayName}
                  label="Approve"
                />
              ) : null}
            </div>

            {data.pendingMembers.length > 1 ? (
              <StaggerList className="mt-4 space-y-2">
                {data.pendingMembers.map((member) => (
                  <StaggerItem
                    key={member.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/70 px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <Bauble name={member.displayName} className="scale-90" />
                      <span className="text-sm font-bold text-ink">{member.displayName}</span>
                    </span>
                    <ApproveMemberButton
                      memberId={member.id}
                      displayName={member.displayName}
                      label="Approve"
                    />
                  </StaggerItem>
                ))}
              </StaggerList>
            ) : null}
          </div>
        </section>
      ) : null}

      {!viewer.event ? (
        <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-8 lg:px-6">
          <NoActiveEventNotice canManage={isOrganiser} />
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8 lg:px-6 lg:py-8">
        <div className="order-2 lg:order-1">
          <div className="flex items-center justify-between gap-3 lg:mt-0">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Who are you buying for?
            </h2>
            <ShareFamilyLink
              url={inviteUrl}
              familyName={viewer.family.name}
              label="+ Invite"
              className="inline-flex min-h-11 items-center rounded-full px-2 text-sm font-bold text-cranberry-ink hover:text-cranberry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            />
          </div>

          {data.members.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-pine-100 bg-white p-6 text-center">
              <p className="text-base font-bold text-ink">You&apos;re the first one here</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Share the family link so everyone can add their wishes.
              </p>
            </div>
          ) : (
            <StaggerList className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.members.map((member) => (
                <StaggerItem
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl border border-pine-100 bg-white p-4 shadow-sm sm:flex-col sm:items-start sm:p-5"
                >
                  <Bauble name={member.displayName} />
                  <div className="min-w-0 flex-1 sm:mt-2">
                    <Link
                      href={`/pick/${member.id}`}
                      className="inline-flex min-h-11 max-w-full items-center truncate text-base font-extrabold text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
                    >
                      {member.displayName}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {member.managedByName
                        ? `Managed by ${member.managedByName}`
                        : member.role === 'organiser'
                          ? 'Organiser'
                          : 'Member'}
                    </p>
                    {member.managedByMemberId === viewer.member.id ? (
                      <Link
                        href={`/wishlist/managed/${member.id}`}
                        className="mt-1 inline-flex min-h-9 items-center text-xs font-bold text-pine-700 underline underline-offset-4 hover:text-pine-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
                      >
                        Manage list
                      </Link>
                    ) : null}
                  </div>
                  {viewer.event ? (
                    <Link
                      href={`/pick/${member.id}`}
                      aria-label={`Pick a gift for ${member.displayName}`}
                      className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-pine-900 px-4 text-sm font-bold text-snow transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 sm:mt-4 sm:w-full sm:justify-center"
                    >
                      Pick a Gift
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-pine-100 px-4 text-sm font-semibold text-muted sm:mt-4 sm:w-full sm:justify-center">
                      No active event
                    </span>
                  )}
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </div>

        <div className="order-1 mt-6 grid grid-cols-2 gap-3 lg:order-2 lg:mt-0 lg:grid-cols-1 lg:gap-4">
          <Link
            href="/wishlist"
            className="rounded-2xl border border-pine-100 bg-white p-4 shadow-sm transition-colors hover:border-pine-700/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 sm:p-5 lg:hidden"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cranberry/10 text-cranberry-ink">
              <GiftIcon className="h-5 w-5" />
            </span>
            <span className="mt-3 block text-base font-extrabold text-ink">My Wishlist</span>
            <span className="mt-0.5 block text-sm text-muted">
              {data.ownGiftCount === 1 ? '1 wish' : `${data.ownGiftCount} wishes`}
            </span>
          </Link>

          <Link
            href="/secret-gifts"
            className="rounded-2xl border border-gold/40 bg-gold-100/70 p-4 shadow-sm transition-colors hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 sm:p-5 lg:hidden"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gold-ink">
              <LockIcon className="h-5 w-5" />
            </span>
            <span className="mt-3 block text-base font-extrabold text-ink">Secret Gifts</span>
            <span className="mt-0.5 block text-sm text-muted">
              {data.reservedCount + data.purchasedCount === 1
                ? '1 claimed'
                : `${data.reservedCount + data.purchasedCount} claimed`}
            </span>
          </Link>

          <div className="col-span-2 hidden rounded-2xl border border-pine-100 bg-white p-5 shadow-sm lg:col-span-1 lg:block">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-base font-extrabold text-ink">My Wishlist</h2>
              <span className="text-sm font-semibold text-cranberry-ink">
                {data.ownGiftCount === 1 ? '1 wish' : `${data.ownGiftCount} wishes`}
              </span>
            </div>
            {data.ownGiftNames.length > 0 ? (
              <ul className="mt-3 space-y-1.5 text-sm text-muted">
                {data.ownGiftNames.map((name) => (
                  <li key={name} className="truncate">
                    {name}
                  </li>
                ))}
                {data.ownGiftCount > data.ownGiftNames.length ? (
                  <li className="text-muted/80">
                    and {data.ownGiftCount - data.ownGiftNames.length} more
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">Your list is waiting for its first wish.</p>
            )}
            <Link
              href={data.ownGiftCount > 0 ? '/wishlist' : '/wishlist/new'}
              className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-pine-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              {data.ownGiftCount > 0 ? 'Edit my list' : 'Add your first wish'}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="col-span-2 hidden rounded-2xl border border-gold/40 bg-gold-100/70 p-5 shadow-sm lg:col-span-1 lg:block">
            <h2 className="text-base font-extrabold text-ink">Secret Gifts</h2>
            <div className="mt-3 flex items-end gap-4">
              <p>
                <span className="text-3xl font-extrabold text-ink">{data.reservedCount}</span>
                <span className="ml-1 text-sm text-muted">reserved</span>
              </p>
              <p>
                <span className="text-3xl font-extrabold text-ink">{data.purchasedCount}</span>
                <span className="ml-1 text-sm text-muted">purchased</span>
              </p>
            </div>
            <Link
              href="/secret-gifts"
              className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-bold text-gold-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              Only you can see these
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
