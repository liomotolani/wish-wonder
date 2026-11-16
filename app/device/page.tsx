import type { Metadata } from 'next';
import { DeviceLinkPanel } from '@/app/_components/DeviceLinkPanel';
import { requireViewer } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Use on another device',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function DevicePage() {
  await requireViewer();

  return (
    <div className="theme-dark relative min-h-screen overflow-hidden bg-pine-900 text-snow">
      <span
        className="snow-dots pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      />
      <main id="main" className="relative flex min-h-screen flex-col">
        <DeviceLinkPanel />
      </main>
    </div>
  );
}
