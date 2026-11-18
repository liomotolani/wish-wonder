import Link from 'next/link';
import { TreeIcon } from '@/app/_components/icons';

interface NoActiveEventNoticeProps {
  canManage: boolean;
  tone?: 'light' | 'dark';
}

export function NoActiveEventNotice({
  canManage,
  tone = 'light',
}: NoActiveEventNoticeProps) {
  const isDark = tone === 'dark';

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${
        isDark
          ? 'border-snow/20 bg-snow/[0.07] text-snow'
          : 'border-gold/40 bg-gold-100/70 text-ink'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            isDark ? 'bg-snow/10 text-gold' : 'bg-white/80 text-gold-ink'
          }`}
        >
          <TreeIcon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold tracking-tight">
            No active Christmas event
          </h2>
          <p
            className={`mt-1 text-sm leading-relaxed ${
              isDark ? 'text-snow/70' : 'text-muted'
            }`}
          >
            The organiser needs to start the next Christmas from Group settings. Wish lists and
            gift picking will return when they do.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {canManage ? (
          <Link
            href="/settings"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-cranberry px-5 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Open Group settings
          </Link>
        ) : null}
        <Link
          href="/family"
          className={`inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 ${
            isDark
              ? 'border border-snow/25 text-snow hover:bg-snow/10 focus-visible:outline-gold'
              : 'border border-pine-100 text-ink hover:bg-pine-100/60 focus-visible:outline-pine-900'
          }`}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
