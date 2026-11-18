import type { Metadata } from 'next';
import Link from 'next/link';
import { requireViewer } from '@/lib/session';
import { Snowfall } from '@/app/_components/motion';
import { ArrowRightIcon, GiftIcon, ShareIcon } from '@/app/_components/icons';
import { groupWording } from '@/lib/groupWording';

export const metadata: Metadata = {
  title: 'Welcome',
  robots: { index: false, follow: false },
};

export default async function StartPage() {
  const viewer = await requireViewer();
  const wording = groupWording(viewer.family.groupType);
  const isOrganiser = viewer.family.organiserMemberId === viewer.member.id;

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="relative isolate min-h-screen overflow-hidden">
        <span className="snow-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <Snowfall />

        <main
          id="main"
          className="relative mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8 sm:py-12"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
            Welcome to {viewer.family.name}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
            {isOrganiser
              ? `Next: add your wishes, then ${wording.inviteButton.toLowerCase()}`
              : 'Next: add your wishes'}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-snow/70">
            {isOrganiser
              ? 'Two short steps and your Christmas list is ready to share.'
              : 'Add a few wishes so everyone knows what you would love.'}
          </p>

          <div className="mt-8 space-y-3">
            <section className="rounded-3xl border border-snow/15 bg-snow/[0.06] p-5 sm:p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cranberry/20 text-white">
                <GiftIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-xl font-extrabold tracking-tight">Add your wishes</h2>
              <p className="mt-1 text-sm leading-relaxed text-snow/65">
                Add a few things you&apos;d love, with sizes, colours and links. Only you can
                edit your list.
              </p>
              <Link
                href="/wishlist/new"
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cranberry px-5 text-sm font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Add my first wish
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </section>

            {isOrganiser ? (
              <section className="rounded-3xl border border-gold/30 bg-gold/10 p-5 sm:p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gold text-pine-900">
                  <ShareIcon className="h-5 w-5" />
                </span>
                <h2 className="mt-3 text-xl font-extrabold tracking-tight">
                  {wording.inviteButton}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-snow/65">
                  Share the link in your chat so everyone can add their own wishes.
                </p>
                <Link
                  href="/family"
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-bold text-pine-900 transition-colors hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snow"
                >
                  {wording.inviteButton}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </section>
            ) : null}
          </div>

          <Link
            href="/family"
            className="mt-6 inline-flex min-h-11 items-center justify-center text-sm font-semibold text-snow/60 hover:text-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Skip for now, take me to my {wording.groupWord}
          </Link>
        </main>
      </div>
    </div>
  );
}
