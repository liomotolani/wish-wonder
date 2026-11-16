import type { ReactNode } from 'react';
import { Snowfall } from '@/app/_components/motion';

interface PageHeaderBandProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
  eyebrow?: ReactNode;
  children?: ReactNode;
  compactTitle?: boolean;
}

export function PageHeaderBand({
  title,
  subtitle,
  action,
  eyebrow,
  children,
  compactTitle = false,
}: PageHeaderBandProps) {
  return (
    <header className="relative isolate w-full overflow-hidden rounded-b-[28px] bg-pine-900 text-snow lg:rounded-none">
      <span className="snow-dots pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <Snowfall variant="header" />
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-8 pt-8 sm:px-8 lg:px-6 lg:pb-10 lg:pt-10">
        {eyebrow ? <div className="mb-5">{eyebrow}</div> : null}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1
              className={`font-extrabold tracking-tight ${
                compactTitle ? 'text-3xl sm:text-5xl' : 'text-4xl sm:text-5xl'
              }`}
            >
              {title}
            </h1>
            <p className="mt-2 text-sm text-snow/70 sm:text-base">{subtitle}</p>
          </div>
          {action ? <div className="shrink-0 pt-1">{action}</div> : null}
        </div>
        {children ? <div className="mt-5">{children}</div> : null}
      </div>
    </header>
  );
}
