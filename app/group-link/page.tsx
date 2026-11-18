import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CopyButton } from '@/app/_components/CopyButton';
import { ArrowRightIcon, LockIcon, ShareIcon } from '@/app/_components/icons';
import { getAppBaseUrl, requireViewer } from '@/lib/session';
import { capitaliseGroupWord, groupWording } from '@/lib/groupWording';

export const metadata: Metadata = {
  title: 'Invite your group',
  robots: { index: false, follow: false },
};

export default async function GroupLinkPage() {
  const viewer = await requireViewer();

  if (viewer.family.organiserMemberId !== viewer.member.id) {
    redirect('/family');
  }

  const wording = groupWording(viewer.family.groupType);
  const groupTitle = capitaliseGroupWord(viewer.family.groupType);
  const inviteUrl = `${await getAppBaseUrl()}/join/${viewer.family.inviteCode}`;

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8 sm:py-12">
          <main id="main" className="flex flex-1 flex-col">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              Your group is ready
            </p>

            <span className="mt-6 inline-flex h-20 w-20 items-center justify-center rounded-[22px] bg-gold text-pine-900">
              <ShareIcon className="h-9 w-9" />
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Share your {wording.groupWord} link
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-snow/70">
              Send this link to everyone you want in {viewer.family.name}. They can join with just
              their name.
            </p>

            <div className="mt-7">
              <label htmlFor="invite-link" className="mb-2 block text-sm font-bold text-snow/85">
                {groupTitle} invite link
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="invite-link"
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="min-w-0 flex-1 rounded-2xl border border-snow/25 bg-snow/10 px-4 py-3 text-sm text-snow/80 focus:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                />
                <CopyButton
                  value={inviteUrl}
                  label="Copy"
                  copiedLabel="Copied"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gold px-5 text-sm font-bold text-pine-900 transition-colors hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snow"
                />
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-snow/60">
              <LockIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              Everyone who opens this link can join. Your own wish list and secret gifts stay
              private.
            </p>

            <div className="mt-auto pt-12">
              <Link
                href="/start"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-cranberry px-6 py-4 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Continue
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
