'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GiftIcon, LockIcon, TreeIcon } from '@/app/_components/icons';

const NAV_ITEMS = [
  { href: '/family', label: 'Home', Icon: TreeIcon },
  { href: '/wishlist', label: 'My Wishlist', Icon: GiftIcon },
  { href: '/secret-gifts', label: 'Secret Gifts', Icon: LockIcon },
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-pine-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-3">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-pine-900 ${
                  isActive ? 'text-cranberry-ink' : 'text-muted'
                }`}
              >
                <Icon className="h-6 w-6" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
