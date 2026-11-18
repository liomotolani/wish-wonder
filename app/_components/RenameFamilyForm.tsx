'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircleIcon } from '@/app/_components/icons';
import {
  GROUP_TYPES,
  GROUP_TYPE_LABELS,
  type GroupType,
} from '@/lib/groupWording';

interface RenameFamilyFormProps {
  currentName: string;
  currentType: GroupType;
}

export function RenameFamilyForm({ currentName, currentType }: RenameFamilyFormProps) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [groupType, setGroupType] = useState<GroupType>(currentType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const unchanged = name.trim() === currentName && groupType === currentType;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch('/api/organiser/family', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, groupType }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? 'We could not save those group details just now.');
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <label htmlFor="family-name" className="mb-2 block text-sm font-bold text-ink">
        Group name
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="family-name"
          name="name"
          type="text"
          required
          maxLength={80}
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setSaved(false);
          }}
          className="min-w-0 flex-1 rounded-2xl border border-pine-100 bg-snow px-4 py-3 text-base text-ink focus:border-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        />
        <button
          type="submit"
          disabled={saving || unchanged}
          className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-pine-900 px-6 text-sm font-bold text-snow transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 block text-sm font-bold text-ink">Who&apos;s this for?</legend>
        <div className="grid grid-cols-2 gap-2">
          {GROUP_TYPES.map((type) => (
            <label
              key={type}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pine-900 ${
                groupType === type
                  ? 'border-pine-700 bg-pine-100 text-pine-700'
                  : 'border-pine-100 bg-white text-muted hover:bg-snow'
              }`}
            >
              <input
                type="radio"
                name="groupType"
                value={type}
                checked={groupType === type}
                onChange={() => {
                  setGroupType(type);
                  setSaved(false);
                }}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                  groupType === type ? 'border-pine-700' : 'border-muted/50'
                }`}
              >
                {groupType === type ? (
                  <span className="h-2 w-2 rounded-full bg-pine-700" />
                ) : null}
              </span>
              {GROUP_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-2xl border border-cranberry/30 bg-cranberry/10 px-4 py-3 text-sm text-cranberry-ink"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      {saved ? (
        <p role="status" className="mt-2 text-sm font-semibold text-pine-700">
          Group details saved.
        </p>
      ) : null}
    </form>
  );
}
