'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GiftIcon, ListIcon } from '@/app/_components/icons';

const STORAGE_KEY = 'ww-picker-view';

export function PickerViewSwitch({
  view,
  boxesHref,
  listHref,
  hasExplicitView,
  enabled,
}: {
  view: 'boxes' | 'list';
  boxesHref: string;
  listHref: string;
  hasExplicitView: boolean;
  enabled: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || hasExplicitView) {
      return;
    }

    try {
      if (window.localStorage.getItem(STORAGE_KEY) === 'list') {
        router.replace(listHref);
      }
    } catch {
      // Storage unavailable: keep the default Boxes view.
    }
  }, [enabled, hasExplicitView, listHref, router]);

  if (!enabled) {
    return null;
  }

  function remember(next: 'boxes' | 'list') {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The URL still remembers the choice for this visit.
    }
  }

  const tabClass = (active: boolean) =>
    `inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
      active ? 'bg-snow text-ink' : 'text-snow/65 hover:text-snow'
    }`;

  return (
    <div
      role="tablist"
      aria-label="Choose boxes or list"
      className="flex w-full max-w-sm gap-1 rounded-full bg-snow/10 p-1"
    >
      <Link
        href={boxesHref}
        role="tab"
        aria-selected={view === 'boxes'}
        onClick={() => remember('boxes')}
        className={tabClass(view === 'boxes')}
      >
        <GiftIcon className="h-4 w-4" />
        Boxes
      </Link>
      <Link
        href={listHref}
        role="tab"
        aria-selected={view === 'list'}
        onClick={() => remember('list')}
        className={tabClass(view === 'list')}
      >
        <ListIcon className="h-4 w-4" />
        List
      </Link>
    </div>
  );
}
