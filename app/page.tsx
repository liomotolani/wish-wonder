import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/app/_components/Logo';
import { GiftCardsIllustration } from '@/app/_components/GiftCardsIllustration';
import { Snowfall } from '@/app/_components/motion';
import { ArrowRightIcon, LockIcon } from '@/app/_components/icons';
import { getViewer } from '@/lib/session';

export const metadata: Metadata = {
  title: {
    absolute: 'Wish & Wonder — Family Christmas wish lists',
  },
};

const STEPS = [
  {
    number: '1',
    title: 'Add your wishes',
    body: "List the gifts you'd love, with sizes, colours and links.",
  },
  {
    number: '2',
    title: 'Pick a mystery number',
    body: 'Each number hides one wish. Peek at as many as you like.',
  },
  {
    number: '3',
    title: 'Claim it in secret',
    body: 'Nobody else can buy it, and the recipient never knows.',
  },
];

export default async function Home() {
  const viewer = await getViewer();

  return (
    <div className="theme-dark flex min-h-screen flex-col bg-pine-900 text-snow">
      <div className="relative isolate flex-1 overflow-hidden">
        <span
          className="snow-dots pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
        />
        <Snowfall />

        <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-6 sm:px-8 lg:px-6 lg:py-10">
          <Logo />
          <div className="flex items-center gap-3">
            {viewer ? (
              <Link
                href="/family"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-snow/10 px-4 text-sm font-bold text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Continue as {viewer.member.displayName}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/join"
                className="hidden min-h-11 items-center rounded-full border border-snow/25 px-5 text-sm font-bold text-snow transition-colors hover:bg-snow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:inline-flex"
              >
                I have an invite link
              </Link>
            )}
          </div>
        </header>

        <main id="main" className="relative mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8 lg:px-6">
          <div className="grid items-center gap-2 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:pt-6">
            <div className="order-2 lg:order-1">
              <p className="hidden w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-gold lg:inline-flex">
                Family Christmas, sorted
              </p>

              <GiftCardsIllustration className="mt-2 lg:hidden" />

              <h1 className="mt-8 max-w-2xl text-5xl font-extrabold leading-[1.03] tracking-[-0.035em] sm:text-6xl lg:mt-6 lg:text-7xl">
                The gifts they want. The{' '}
                <span className="text-gold">surprises</span> they deserve.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-snow/70 sm:text-lg">
                Share wish lists as a family, then pick a mystery number to find the perfect
                present. Nobody sees what&apos;s coming.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/create"
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-cranberry px-8 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Create a Family
                </Link>
                <Link
                  href="/join"
                  className="inline-flex min-h-14 items-center justify-center rounded-full border border-snow/25 px-8 text-base font-bold text-snow transition-colors hover:bg-snow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Join with a link
                </Link>
              </div>

              <p className="mt-4 text-sm text-snow/55">No accounts. No passwords. Just a link.</p>
            </div>

            <div className="order-1 hidden lg:order-2 lg:block">
              <GiftCardsIllustration className="lg:scale-110" />
            </div>
          </div>

          <ul className="mt-16 hidden gap-4 pb-4 sm:grid sm:grid-cols-3 lg:mt-20">
            {STEPS.map((step) => (
              <li
                key={step.number}
                className="rounded-2xl border border-snow/10 bg-snow/[0.06] p-5"
              >
                <span className="text-xl font-extrabold text-gold">{step.number}</span>
                <h2 className="mt-3 text-base font-bold text-snow">{step.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-snow/60">{step.body}</p>
              </li>
            ))}
          </ul>

          <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-snow/60">
            <LockIcon className="h-4 w-4" />
            Surprises are protected on the server, not just hidden on screen.
          </p>
        </main>
      </div>
    </div>
  );
}
