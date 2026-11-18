import type { Metadata } from 'next';
import Link from 'next/link';
import { Bauble } from '@/app/_components/Bauble';
import { Logo } from '@/app/_components/Logo';
import { AlertCircleIcon, ChevronLeftIcon, DeviceIcon, LockIcon } from '@/app/_components/icons';
import { JoinFamilyForm } from '@/app/_components/JoinFamilyForm';
import { getFamilyInvitePreview } from '@/lib/db/families';
import { groupWording } from '@/lib/groupWording';
import { inviteCodeSchema } from '@/lib/validation';

interface JoinFamilyPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({
  params,
}: JoinFamilyPageProps): Promise<Metadata> {
  const { code } = await params;
  const parsedCode = inviteCodeSchema.safeParse(code);

  if (!parsedCode.success) {
    return { title: 'Join your group', robots: { index: false, follow: false } };
  }

  const preview = await getFamilyInvitePreview(parsedCode.data);

  return {
    title: preview ? `Join ${preview.familyName}` : 'Join your group',
    robots: { index: false, follow: false },
  };
}

export default async function JoinFamilyPage({ params }: JoinFamilyPageProps) {
  const { code } = await params;
  const parsedCode = inviteCodeSchema.safeParse(code);

  if (!parsedCode.success) {
    return <InvalidInvite />;
  }

  const preview = await getFamilyInvitePreview(parsedCode.data);

  if (!preview) {
    return <InvalidInvite />;
  }

  const extraCount = Math.max(0, preview.memberCount - preview.memberNames.length);
  const wording = groupWording(preview.groupType);

  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6 sm:px-8 sm:py-10">
          <div className="flex items-center justify-between">
            <Logo href="/" />
            <Link
              href="/"
              aria-label="Back to the welcome page"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-snow/10 text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </Link>
          </div>

          <main id="main" className="flex flex-1 flex-col pt-8 sm:pt-12">
            <section className="rounded-3xl border border-snow/15 bg-snow/[0.06] p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold">
                {wording.joinPage}
              </p>
              <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
                {preview.familyName}
              </h1>

              <div className="mt-5 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {preview.memberNames.map((name) => (
                    <Bauble key={name} name={name} />
                  ))}
                </div>
                <p className="text-sm text-snow/65">
                  {preview.memberNames.join(', ')}
                  {extraCount > 0 ? ` and ${extraCount} ${extraCount === 1 ? 'other' : 'others'}` : ''}
                </p>
              </div>

              {preview.requiresApproval ? (
                <p className="mt-5 flex items-start gap-2 rounded-2xl bg-gold/10 px-4 py-3 text-sm leading-relaxed text-gold">
                  <LockIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  The organiser checks new members, so your lists will appear once you&apos;re
                  approved.
                </p>
              ) : null}
            </section>

            <div className="mt-8">
              <JoinFamilyForm
                inviteCode={parsedCode.data}
                groupWord={wording.groupWord}
              />
            </div>

            <p className="mt-7 flex items-start gap-2 rounded-2xl border border-snow/10 bg-snow/[0.06] px-4 py-3 text-sm leading-relaxed text-snow/65">
              <DeviceIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>
                Already a member? Open your personal link on this device, or use{' '}
                <strong className="font-bold text-snow">Use on another device</strong> from a
                device you&apos;re already signed in on.
              </span>
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}

function InvalidInvite() {
  return (
    <div className="theme-dark min-h-screen bg-pine-900 text-snow">
      <div className="snow-dots min-h-screen">
        <div className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 py-6 sm:px-8 sm:py-10">
          <Logo href="/" />
          <main id="main" className="flex flex-1 flex-col justify-center py-10">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cranberry/20 text-gold">
              <AlertCircleIcon className="h-7 w-7" />
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight">This invite link is old</h1>
            <p className="mt-3 text-base leading-relaxed text-snow/70">
              Ask your group organiser to share the invite link again. They can copy it from the
              home page.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex min-h-14 w-fit items-center justify-center rounded-full bg-cranberry px-7 text-base font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Back to Wish &amp; Wonder
            </Link>
          </main>
        </div>
      </div>
    </div>
  );
}
