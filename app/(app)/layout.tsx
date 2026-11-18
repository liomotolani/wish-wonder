import type { ReactNode } from 'react';
import { requireViewer } from '@/lib/session';
import { listDeviceGroups } from '@/lib/db/device-groups';
import { SiteHeader } from '@/app/_components/SiteHeader';
import { MobileTabBar } from '@/app/_components/MobileTabBar';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const viewer = await requireViewer();
  const groups = await listDeviceGroups();

  return (
    <div className="flex min-h-screen flex-col bg-snow">
      <SiteHeader
        isOrganiser={viewer.family.organiserMemberId === viewer.member.id}
        groupName={viewer.family.name}
        groups={groups}
      />
      <div className="flex-1 pb-20 lg:pb-0">{children}</div>
      <MobileTabBar />
    </div>
  );
}
