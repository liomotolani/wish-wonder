import type { ReactNode } from 'react';
import { requireViewer } from '@/lib/session';
import { daysUntilChristmas } from '@/lib/dates';
import { SiteHeader } from '@/app/_components/SiteHeader';
import { MobileTabBar } from '@/app/_components/MobileTabBar';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const viewer = await requireViewer();

  return (
    <div className="flex min-h-screen flex-col bg-snow">
      <SiteHeader
        viewerName={viewer.member.displayName}
        daysUntilChristmas={daysUntilChristmas()}
        isOrganiser={viewer.family.organiserMemberId === viewer.member.id}
      />
      <div className="flex-1 pb-20 lg:pb-0">{children}</div>
      <MobileTabBar />
    </div>
  );
}
