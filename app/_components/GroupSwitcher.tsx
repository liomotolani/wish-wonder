'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { MotionDialog } from '@/app/_components/motion';
import { ChevronDownIcon, PlusIcon, TrashIcon } from '@/app/_components/icons';
import { removeGroupAction, switchGroupAction } from '@/app/actions/groups';
import { groupTypeLabel } from '@/lib/groupWording';
import type { DeviceGroupView } from '@/lib/types';

interface GroupSwitcherProps {
  label: string;
  groups: DeviceGroupView[];
  variant?: 'hero' | 'header';
}

function initialsFor(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return 'G';
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

const TRIGGER_CLASS = {
  hero: 'inline-flex max-w-full items-center gap-2 rounded-full bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
  header:
    'inline-flex min-h-11 max-w-[15rem] items-center gap-2 rounded-full border border-snow/25 bg-snow/5 px-4 text-sm font-semibold text-snow transition-colors hover:bg-snow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
} as const;

/**
 * A button showing the active group, opening a sheet of every group this
 * device remembers. Switching and removing are Server Actions, so the page
 * always loads exactly one group's data.
 */
export function GroupSwitcher({ label, groups, variant = 'hero' }: GroupSwitcherProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null);

  function open() {
    setConfirmingRemoveId(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" onClick={open} className={TRIGGER_CLASS[variant]}>
        <span className="truncate">{label}</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0" />
      </button>

      <MotionDialog dialogRef={dialogRef} labelledBy={titleId} mobileSheet>
        <div className="max-h-[85vh] overflow-y-auto px-5 pb-7 pt-6 sm:px-7 sm:pb-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id={titleId} className="text-2xl font-extrabold tracking-tight text-ink">
                Your groups
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Each group has its own wish lists and secret gifts.
              </p>
            </div>
            <Link
              href="/create"
              aria-label="Start another group"
              title="Start another group"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cranberry text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              <PlusIcon className="h-5 w-5" />
            </Link>
          </div>

          <ul className="mt-5 space-y-3">
            {groups.map((group) => {
              const isConfirming = confirmingRemoveId === group.familyId;

              return (
                <li
                  key={group.familyId}
                  className={`flex items-stretch gap-1 rounded-2xl border p-1 pr-2 ${
                    group.isActive
                      ? 'border-gold bg-gold-100/70'
                      : 'border-pine-100 bg-white'
                  }`}
                >
                  <form action={switchGroupAction.bind(null, group.familyId)} className="min-w-0 flex-1">
                    <button
                      type="submit"
                      aria-current={group.isActive ? 'true' : undefined}
                      onClick={(event) => {
                        if (group.isActive) {
                          event.preventDefault();
                          close();
                        }
                      }}
                      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-snow/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pine-100 text-sm font-extrabold text-pine-700">
                        {initialsFor(group.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-extrabold leading-snug text-ink">
                          {group.name}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted">
                          {groupTypeLabel(group.groupType)} · you&apos;re {group.memberName}
                        </span>
                      </span>
                    </button>
                  </form>

                  <form action={removeGroupAction.bind(null, group.familyId)}>
                    <button
                      type="submit"
                      aria-label={
                        isConfirming
                          ? `Tap again to remove ${group.name} from this device`
                          : `Remove ${group.name} from this device`
                      }
                      title="Remove from this device"
                      onClick={(event) => {
                        if (!isConfirming) {
                          event.preventDefault();
                          setConfirmingRemoveId(group.familyId);
                        }
                      }}
                      className={`inline-flex min-h-11 items-center justify-center self-center rounded-full px-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 ${
                        isConfirming
                          ? 'bg-cranberry px-3 text-white hover:bg-cranberry-ink'
                          : 'text-muted hover:bg-cranberry/10 hover:text-cranberry-ink'
                      }`}
                    >
                      {isConfirming ? 'Sure?' : <TrashIcon className="h-4 w-4" />}
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>

          <div className="mt-5">
            <Link
              href="/join"
              className="flex min-h-12 items-center justify-center rounded-full border border-pine-100 px-5 text-sm font-bold text-ink transition-colors hover:bg-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              Join with an invite link
            </Link>
          </div>
        </div>
      </MotionDialog>
    </>
  );
}
