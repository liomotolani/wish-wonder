'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircleIcon } from '@/app/_components/icons';
import {
  GROUP_TYPES,
  GROUP_TYPE_LABELS,
  groupWording,
  type GroupType,
} from '@/lib/groupWording';

interface CreateFamilyFormProps {
  initialRequiresApproval?: boolean;
  defaultMemberName?: string;
  defaultPickerStyle?: 'boxes' | 'list';
}

const INPUT_CLASS =
  'w-full rounded-2xl border border-snow/25 bg-snow/10 px-5 py-3.5 text-base text-snow placeholder:text-snow/60 focus:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:border-pine-100 lg:bg-snow lg:text-ink lg:placeholder:text-muted';
const LABEL_CLASS = 'mb-2 block text-sm font-bold text-snow/85 lg:text-ink';

export function CreateFamilyForm({
  initialRequiresApproval = true,
  defaultMemberName = '',
  defaultPickerStyle,
}: CreateFamilyFormProps) {
  const router = useRouter();
  const [groupType, setGroupType] = useState<GroupType>('family');
  const [familyName, setFamilyName] = useState('');
  const [memberName, setMemberName] = useState(defaultMemberName);
  const [requiresApproval, setRequiresApproval] = useState(initialRequiresApproval);
  const [mysteryBoxes, setMysteryBoxes] = useState(
    defaultPickerStyle !== 'list',
  );

  useEffect(() => {
    if (defaultPickerStyle) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = window.localStorage.getItem('ww-picker-default');

        if (stored === 'list') {
          setMysteryBoxes(false);
        } else if (stored === 'boxes') {
          setMysteryBoxes(true);
        }
      } catch {
        // Default to mystery boxes.
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [defaultPickerStyle]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const wording = groupWording(groupType);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch('/api/families', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyName,
          groupType,
          memberName,
          requiresApproval,
          mysteryBoxes,
        }),
      });
      const data = (await response.json()) as {
        inviteLink?: string;
        next?: string;
        error?: string;
      };

      if (!response.ok || !data.next) {
        setError(data.error ?? 'We could not start your group just now. Please try again.');
        return;
      }

      router.push(data.next);
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-full flex-col">
      <div className="space-y-5">
        <fieldset>
          <legend className={LABEL_CLASS}>Who&apos;s this for?</legend>
          <div className="grid grid-cols-2 gap-3">
            {GROUP_TYPES.map((type) => {
              const optionWording = groupWording(type);

              return (
                <label
                  key={type}
                  className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-base font-bold transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold ${
                    groupType === type
                      ? 'border-gold bg-gold/15 text-snow lg:bg-gold-100/70 lg:text-ink'
                      : 'border-snow/20 bg-snow/[0.04] text-snow/80 hover:bg-snow/10 lg:border-pine-100 lg:bg-white lg:text-ink lg:hover:bg-snow'
                  }`}
                >
                  <input
                    type="radio"
                    name="groupType"
                    value={type}
                    checked={groupType === type}
                    onChange={() => setGroupType(type)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      groupType === type
                        ? 'border-cranberry'
                        : 'border-snow/50 lg:border-muted/50'
                    }`}
                  >
                    {groupType === type ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-cranberry" />
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block">{GROUP_TYPE_LABELS[type]}</span>
                    <span className="sr-only"> — {optionWording.groupWord}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className={LABEL_CLASS}>How should buyers pick?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold ${
                mysteryBoxes
                  ? 'border-gold bg-gold/15 text-snow lg:bg-gold-100/70 lg:text-ink'
                  : 'border-snow/20 bg-snow/[0.04] text-snow/80 hover:bg-snow/10 lg:border-pine-100 lg:bg-white lg:text-ink lg:hover:bg-snow'
              }`}
            >
              <input
                type="radio"
                name="pickerStyle"
                value="boxes"
                checked={mysteryBoxes}
                onChange={() => setMysteryBoxes(true)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  mysteryBoxes ? 'border-cranberry' : 'border-snow/50 lg:border-muted/50'
                }`}
              >
                {mysteryBoxes ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-cranberry" />
                ) : null}
              </span>
              <span>
                <span className="block text-sm font-bold">Mystery boxes</span>
                <span className="mt-0.5 block text-xs leading-relaxed opacity-75">
                  Prices on every box; gifts stay a surprise.
                </span>
              </span>
            </label>

            <label
              className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold ${
                !mysteryBoxes
                  ? 'border-gold bg-gold/15 text-snow lg:bg-gold-100/70 lg:text-ink'
                  : 'border-snow/20 bg-snow/[0.04] text-snow/80 hover:bg-snow/10 lg:border-pine-100 lg:bg-white lg:text-ink lg:hover:bg-snow'
              }`}
            >
              <input
                type="radio"
                name="pickerStyle"
                value="list"
                checked={!mysteryBoxes}
                onChange={() => setMysteryBoxes(false)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  !mysteryBoxes ? 'border-cranberry' : 'border-snow/50 lg:border-muted/50'
                }`}
              >
                {!mysteryBoxes ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-cranberry" />
                ) : null}
              </span>
              <span>
                <span className="block text-sm font-bold">List view</span>
                <span className="mt-0.5 block text-xs leading-relaxed opacity-75">
                  Show every gift and price straight away.
                </span>
              </span>
            </label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="family-name" className={LABEL_CLASS}>
            Group name
          </label>
          <input
            id="family-name"
            name="familyName"
            type="text"
            required
            maxLength={80}
            value={familyName}
            onChange={(event) => setFamilyName(event.target.value)}
            placeholder={wording.nameExample}
            className={INPUT_CLASS}
            autoComplete="organization"
          />
        </div>

        <div>
          <label htmlFor="member-name" className={LABEL_CLASS}>
            Your name
          </label>
          <input
            id="member-name"
            name="memberName"
            type="text"
            required
            maxLength={40}
            value={memberName}
            onChange={(event) => setMemberName(event.target.value)}
            placeholder="e.g. Alex"
            className={INPUT_CLASS}
            autoComplete="given-name"
          />
        </div>

        <label
          htmlFor="requires-approval"
          className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-snow/10 px-5 py-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gold lg:bg-snow"
        >
          <span>
            <span className="block text-base font-bold text-snow lg:text-ink">
              Approve new members
            </span>
            <span className="mt-0.5 block text-sm text-snow/70 lg:text-muted">
              Check who joins before they see any lists
            </span>
          </span>
          <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
            <input
              id="requires-approval"
              name="requiresApproval"
              type="checkbox"
              checked={requiresApproval}
              onChange={(event) => setRequiresApproval(event.target.checked)}
              className="peer h-7 w-7 appearance-none rounded-md border-2 border-snow/40 bg-transparent checked:border-cranberry checked:bg-cranberry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:border-muted/60"
            />
            <svg
              className="pointer-events-none absolute h-4 w-4 text-snow opacity-0 peer-checked:opacity-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m4 12 5 5L20 6" />
            </svg>
          </span>
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2 rounded-2xl border border-cranberry/40 bg-cranberry/15 px-4 py-3 text-sm text-snow lg:border-cranberry/30 lg:bg-cranberry/10 lg:text-cranberry-ink"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          {error}
        </p>
      ) : null}

      <div className="mt-auto pt-10">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-cranberry px-6 py-4 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? 'Starting your group…' : 'Start group'}
        </button>
        <p className="mt-4 text-center text-sm text-snow/60 lg:text-muted">
          You&apos;ll be the organiser. You can change this later.
        </p>
      </div>
    </form>
  );
}
