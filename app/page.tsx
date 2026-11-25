import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/app/_components/Logo';
import { GiftCardsIllustration } from '@/app/_components/GiftCardsIllustration';
import { LandingPickerShowcase } from '@/app/_components/LandingPickerShowcase';
import { Snowfall } from '@/app/_components/motion';
import { ArrowRightIcon, GiftIcon, LockIcon, StarIcon } from '@/app/_components/icons';
import { getViewer } from '@/lib/session';

export const metadata: Metadata = {
  title: {
    absolute: 'Wish & Wonder — Christmas wish lists for groups',
  },
};

const STEPS = [
  {
    Icon: StarIcon,
    title: 'Make a Wish',
    body: "Add the gifts you'd love, down to the little details.",
  },
  {
    Icon: GiftIcon,
    title: 'Reveal the Magic',
    body: 'Pick a mystery number and uncover a wish. Keep exploring!',
  },
  {
    Icon: LockIcon,
    title: 'Keep the Secret',
    body: "Claim a gift so it's yours to give, without spoiling the surprise.",
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
                className="inline-flex min-h-11 max-w-[11rem] items-center gap-2 rounded-full bg-snow/10 px-2.5 text-xs font-bold text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:max-w-[26rem] sm:px-4 sm:text-sm"
              >
                <span className="truncate">Continue to {viewer.family.name}</span>
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
              </Link>
            ) : null}
          </div>
        </header>

        <main id="main" className="relative mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8 lg:px-6">
          <div className="grid items-center gap-2 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:pt-6">
            <div className="order-2 lg:order-1">
              <GiftCardsIllustration className="mt-2 lg:hidden" />

              <h1 className="mt-8 max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:mt-6 lg:text-7xl">
                Where Christmas Wishes Become{' '}
                <span className="text-gold">Magical Surprises</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-snow/70 sm:text-lg">
                Share wishes, reveal gifts, and keep the magic of surprise alive.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/create"
                  className="inline-flex min-h-14 items-center justify-center whitespace-nowrap rounded-full bg-cranberry px-8 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Start a group
                </Link>
                <Link
                  href="/join"
                  className="inline-flex min-h-14 items-center justify-center whitespace-nowrap rounded-full border border-snow/25 px-8 text-base font-bold text-snow transition-colors hover:bg-snow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  Join a group
                </Link>
              </div>
            </div>

            <div className="order-1 hidden lg:order-2 lg:block">
              <GiftCardsIllustration className="lg:scale-110" />
            </div>
          </div>

          <LandingPickerShowcase />

          <ul className="mt-16 hidden gap-4 pb-4 sm:grid sm:grid-cols-3 lg:mt-20">
            {STEPS.map((step) => (
              <li
                key={step.title}
                className="rounded-2xl border border-snow/10 bg-snow/[0.06] p-5"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <step.Icon className="h-4.5 w-4.5" />
                </span>
                <h2 className="mt-3 text-base font-bold text-snow">{step.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-snow/60">{step.body}</p>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
