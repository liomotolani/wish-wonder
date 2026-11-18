'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/app/_components/Logo';
import { GroupSwitcher } from '@/app/_components/GroupSwitcher';
import { GiftIcon, LockIcon, SettingsIcon, TreeIcon } from '@/app/_components/icons';
import type { DeviceGroupView } from '@/lib/types';

interface SiteHeaderProps {
  isOrganiser: boolean;
  groupName: string;
  groups: DeviceGroupView[];
}

const NAV_ITEMS = [
  { href: '/family', label: 'Home', Icon: TreeIcon },
  { href: '/wishlist', label: 'My Wishlist', Icon: GiftIcon },
  { href: '/secret-gifts', label: 'Secret Gifts', Icon: LockIcon },
];

export function SiteHeader({ isOrganiser, groupName, groups }: SiteHeaderProps) {
  const pathname = usePathname();
  const isSettings = pathname === '/settings';

  return (
    <header className="relative hidden w-full overflow-hidden bg-pine-900 text-snow lg:block">
      <span className="snow-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <Logo href="/" />
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                    isActive
                      ? 'bg-snow/10 text-snow'
                      : 'text-snow/70 hover:bg-snow/5 hover:text-snow'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <GroupSwitcher label={groupName} groups={groups} variant="header" />
          {isOrganiser ? (
            <Link
              href="/settings"
              aria-label="Group settings"
              title="Group settings"
              aria-current={isSettings ? 'page' : undefined}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                isSettings
                  ? 'bg-snow/10 text-snow'
                  : 'text-snow/70 hover:bg-snow/5 hover:text-snow'
              }`}
            >
              <SettingsIcon className="h-5 w-5" />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
