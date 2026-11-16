'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/app/_components/Logo';
import { Bauble } from '@/app/_components/Bauble';
import { GiftIcon, LockIcon, TreeIcon } from '@/app/_components/icons';

interface SiteHeaderProps {
  viewerName: string;
  daysUntilChristmas: number;
  isOrganiser: boolean;
}

const NAV_ITEMS = [
  { href: '/family', label: 'Family', Icon: TreeIcon },
  { href: '/wishlist', label: 'My Wishlist', Icon: GiftIcon },
  { href: '/secret-gifts', label: 'Secret Gifts', Icon: LockIcon },
];

export function SiteHeader({
  viewerName,
  daysUntilChristmas,
  isOrganiser,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const isSettings = pathname === '/settings';

  return (
    <header className="relative hidden w-full overflow-hidden bg-pine-900 text-snow lg:block">
      <span className="snow-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-6 px-6">
        <div className="flex items-center gap-8">
          <Logo href="/family" />
          <nav aria-label="Main navigation" className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
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
          {isOrganiser ? (
            <Link
              href="/settings"
              aria-current={isSettings ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                isSettings
                  ? 'bg-snow/10 text-snow'
                  : 'text-snow/70 hover:bg-snow/5 hover:text-snow'
              }`}
            >
              Settings
            </Link>
          ) : null}
          <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-2 text-sm font-semibold text-gold">
            <TreeIcon className="h-4 w-4" />
            {daysUntilChristmas === 0
              ? 'Christmas Day is here'
              : `${daysUntilChristmas} days to Christmas`}
          </span>
          <span className="inline-flex items-center" title={`Signed in as ${viewerName}`}>
            <Bauble name={viewerName} />
            <span className="sr-only">Signed in as {viewerName}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
