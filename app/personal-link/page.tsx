import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CopyButton } from '@/app/_components/CopyButton';
import { AlertCircleIcon, KeyIcon } from '@/app/_components/icons';
import { getAppBaseUrl, getActiveSessionToken, getViewer } from '@/lib/session';
import { groupWording } from '@/lib/groupWording';
import { isPersonalTokenFormat } from '@/lib/tokens';

export const metadata: Metadata = {
  title: 'Your personal link',
  robots: { index: false, follow: false },
};

interface PersonalLinkPageProps {
  searchParams: Promise<{
    status?: string | string[];
    created?: string | string[];
    token?: string | string[];
  }>;
}

export default async function PersonalLinkPage({ searchParams }: PersonalLinkPageProps) {
  const params = await searchParams;

  // Old links used to carry the token here. Strip it before anything renders,
  // so opening a stale history entry does not keep the token in the address bar.
  if (params.token !== undefined) {
    const query = new URLSearchParams();
    if (params.status === 'pending') {
      query.set('status', 'pending');
    }
    if (params.created === '1') {
      query.set('created', '1');
    }
    const suffix = query.toString();
    redirect(`/personal-link${suffix ? `?${suffix}` : ''}`);
  }

  const token = (await getActiveSessionToken()) ?? '';

  if (!isPersonalTokenFormat(token)) {
    redirect('/link-expired');
  }

  const viewer = await getViewer();
  const wording = groupWording(viewer?.family.groupType);
  const isPending = params.status === 'pending';
  const isCreated = params.created === '1';
  const personalLink = `${await getAppBaseUrl()}/me/${token}`;
  const continueHref = isPending ? '/pending' : isCreated ? '/start' : '/family';

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-8 sm:px-8 sm:py-12">
          <main id="main" className="flex flex-1 flex-col">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
              {isPending ? 'One more step' : "You're in"}
            </p>

            <span className="mt-6 inline-flex h-20 w-20 items-center justify-center rounded-[22px] bg-gold text-pine-900">
              <KeyIcon className="h-9 w-9" />
            </span>

            <h1 className="mt-7 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              This link is your key
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-snow/70">
              Use it to get back to your wish list and your secret gifts on any device. Keep it
              private: anyone with it can see your secret gifts.
            </p>

            {isPending ? (
              <p className="mt-5 flex items-start gap-2 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm leading-relaxed text-gold">
                <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                The organiser of your {wording.groupWord} still needs to approve you. Save this
                link and come back once they have.
              </p>
            ) : null}

            {isCreated ? (
              <p className="mt-5 rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm font-semibold leading-relaxed text-gold">
                Next: add your wishes, then {wording.inviteButton.toLowerCase()}.
              </p>
            ) : null}

            <div className="mt-7">
              <label htmlFor="personal-link" className="mb-2 block text-sm font-bold text-snow/85">
                Your personal link
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="personal-link"
                  type="text"
                  readOnly
                  value={personalLink}
                  className="min-w-0 flex-1 rounded-2xl border border-snow/25 bg-snow/10 px-4 py-3 text-sm text-snow/80 focus:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                />
                <CopyButton
                  value={personalLink}
                  label="Copy"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gold px-5 text-sm font-bold text-pine-900 transition-colors hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snow"
                />
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-snow/60">
              <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              Lost it? Ask the organiser of your {wording.groupWord} for a new one.
            </p>

            <div className="mt-auto pt-12">
              <Link
                href={continueHref}
                className="flex w-full items-center justify-center rounded-full bg-cranberry px-6 py-4 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                I&apos;ve saved it, continue
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
