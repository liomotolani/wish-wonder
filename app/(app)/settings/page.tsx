import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAppBaseUrl, requireViewer } from '@/lib/session';
import { getSettingsData } from '@/lib/db/organiser';
import { PageHeaderBand } from '@/app/_components/PageHeaderBand';
import { Bauble } from '@/app/_components/Bauble';
import { CopyButton } from '@/app/_components/CopyButton';
import { ApprovalToggle } from '@/app/_components/ApprovalToggle';
import { ApproveMemberButton } from '@/app/_components/ApproveMemberButton';
import { EventActions } from '@/app/_components/EventActions';
import { RemoveMemberButton } from '@/app/_components/RemoveMemberButton';
import { ReissueLinkButton } from '@/app/_components/ReissueLinkButton';
import { RenameFamilyForm } from '@/app/_components/RenameFamilyForm';
import { LockIcon, ChevronLeftIcon } from '@/app/_components/icons';
import { capitaliseGroupWord, groupWording } from '@/lib/groupWording';

export const metadata: Metadata = {
  title: 'Group settings',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const viewer = await requireViewer();

  if (viewer.family.organiserMemberId !== viewer.member.id) {
    redirect('/family');
  }

  const data = await getSettingsData(viewer);
  const inviteUrl = `${await getAppBaseUrl()}/join/${viewer.family.inviteCode}`;
  const wording = groupWording(viewer.family.groupType);
  const groupWordTitle = capitaliseGroupWord(viewer.family.groupType);

  return (
    <main id="main">
      <PageHeaderBand
        title={`${groupWordTitle} settings`}
        subtitle="You're the organiser. You can't see anyone's secret gifts."
        action={
          <Link
            href="/family"
            aria-label="Back to Home"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-snow/10 text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:hidden"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </Link>
        }
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-5 lg:px-6 lg:py-8">
        <section
          aria-labelledby="family-settings-heading"
          className="rounded-2xl border border-pine-100 bg-white p-5 shadow-sm sm:p-6 lg:col-start-1 lg:row-start-1"
        >
          <h2 id="family-settings-heading" className="text-lg font-extrabold text-ink">
            {groupWordTitle}
          </h2>
          <RenameFamilyForm
            currentName={viewer.family.name}
            currentType={viewer.family.groupType}
          />

          <div className="mt-5">
            <label htmlFor="invite-link" className="mb-2 block text-sm font-bold text-ink">
              Invite link
            </label>
            <div className="flex items-stretch gap-2">
              <input
                id="invite-link"
                type="text"
                readOnly
                value={inviteUrl}
                className="min-w-0 flex-1 rounded-2xl border border-pine-100 bg-snow px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
              />
              <CopyButton
                value={inviteUrl}
                label="Copy invite link"
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-gold px-4 text-sm font-bold text-pine-900 transition-colors hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
              />
            </div>
          </div>
        </section>

        <section
          aria-labelledby="approvals-heading"
          className="mt-5 rounded-2xl border border-gold/40 bg-gold-100/70 p-5 shadow-sm sm:p-6 lg:col-start-2 lg:row-start-1 lg:mt-0"
        >
          <h2 id="approvals-heading" className="text-lg font-extrabold text-ink">
            Approvals
          </h2>
          <div className="mt-4">
            <ApprovalToggle initialEnabled={viewer.family.requiresApproval} />
          </div>

          {data.pendingMembers.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {data.pendingMembers.map((member) => (
                <li
                  key={member.id}
                  className="rounded-xl bg-white/80 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Bauble name={member.displayName} className="scale-90" />
                    <span className="text-sm font-bold text-ink">{member.displayName}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <ApproveMemberButton
                      memberId={member.id}
                      displayName={member.displayName}
                      label="Approve"
                    />
                    <RemoveMemberButton
                      memberId={member.id}
                      displayName={member.displayName}
                      variant="decline"
                      groupWord={wording.groupWord}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              No one is waiting to join.
            </p>
          )}
        </section>

        <section
          aria-labelledby="members-heading"
          className="mt-5 rounded-2xl border border-pine-100 bg-white p-5 shadow-sm sm:p-6 lg:col-start-1 lg:row-start-2 lg:mt-0"
        >
          <h2 id="members-heading" className="text-lg font-extrabold text-ink">
            Members
          </h2>
          <ul className="mt-3 divide-y divide-pine-100">
            {data.members.map((member) => (
              <li key={member.id} className="flex flex-wrap items-center gap-3 py-3">
                <Bauble name={member.displayName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-ink">
                    {member.displayName}
                  </p>
                  <p className="text-xs text-muted">
                    {member.isOrganiser
                      ? 'Organiser'
                      : member.managedByName
                        ? `Managed by ${member.managedByName}`
                        : 'Member'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <ReissueLinkButton
                    memberId={member.id}
                    displayName={member.displayName}
                    isSelf={member.isOrganiser}
                  />
                  {member.isOrganiser ? (
                    <span className="inline-flex min-h-11 items-center px-2 text-xs font-semibold text-muted">
                      You
                    </span>
                  ) : (
                    <RemoveMemberButton
                      memberId={member.id}
                      displayName={member.displayName}
                      groupWord={wording.groupWord}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="events-heading"
          className="mt-5 rounded-2xl border border-pine-100 bg-white p-5 shadow-sm sm:p-6 lg:col-start-2 lg:row-start-2 lg:mt-0"
        >
          <h2 id="events-heading" className="text-lg font-extrabold text-ink">
            Events
          </h2>
          <div className="mt-3">
            {data.activeEvent ? (
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-extrabold text-ink">{data.activeEvent.name}</p>
                  <p className="text-xs font-semibold text-pine-700">Active event</p>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted">
                There is no active event. Start one to give your {wording.groupWord} a fresh wish
                list.
              </p>
            )}
            <div className="mt-4">
              <EventActions activeEvent={data.activeEvent} groupWord={wording.groupWord} />
            </div>
          </div>
        </section>
      </div>

      <p className="mx-auto flex w-full max-w-6xl items-center justify-center gap-2 px-4 pb-4 text-center text-xs text-muted lg:pb-8">
        <LockIcon className="h-4 w-4" />
        As organiser you can&apos;t see anyone&apos;s secret gifts.
      </p>

      <div className="mx-auto w-full max-w-6xl px-4 pb-6 sm:px-8 lg:px-6">
        <Link
          href="/family"
          className="inline-flex min-h-11 items-center rounded-full text-sm font-bold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
