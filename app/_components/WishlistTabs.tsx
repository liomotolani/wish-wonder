import Link from 'next/link';
import { PlusIcon } from '@/app/_components/icons';
import type { ManagedMemberView } from '@/lib/types';

interface WishlistTabsProps {
  managedMembers: ManagedMemberView[];
  activeMemberId: string | null;
}

export function WishlistTabs({ managedMembers, activeMemberId }: WishlistTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <nav
        aria-label="Wish lists"
        className="inline-flex max-w-full flex-wrap gap-1 rounded-full bg-snow/10 p-1"
      >
        <Link
          href="/wishlist"
          aria-current={activeMemberId === null ? 'page' : undefined}
          className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
            activeMemberId === null
              ? 'bg-white text-ink'
              : 'text-snow/70 hover:text-snow'
          }`}
        >
          My list
        </Link>
        {managedMembers.map((member) => (
          <Link
            key={member.id}
            href={`/wishlist/managed/${member.id}`}
            aria-current={activeMemberId === member.id ? 'page' : undefined}
            className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              activeMemberId === member.id
                ? 'bg-white text-ink'
                : 'text-snow/70 hover:text-snow'
            }`}
          >
            {member.displayName}
          </Link>
        ))}
      </nav>

      <Link
        href="/family/add-person"
        className="inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-sm font-bold text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <PlusIcon className="h-4 w-4" />
        Add a person
      </Link>
    </div>
  );
}
