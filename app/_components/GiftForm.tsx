'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircleIcon,
  CameraIcon,
  StarIcon,
} from '@/app/_components/icons';
import { PRIORITY_REALLY_WANT, penceToPoundsInput, poundsToPence } from '@/lib/validation';
import { compressPhoto } from '@/lib/compress-photo';
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  isCurrencyCode,
  type CurrencyCode,
} from '@/lib/currencies';
import type { OwnGiftView } from '@/lib/types';

interface GiftFormProps {
  gift?: OwnGiftView;
  ownerMemberId?: string;
  ownerName?: string;
  returnHref?: string;
}

const INPUT_CLASS =
  'w-full rounded-2xl border border-pine-100 bg-white px-4 py-3.5 text-base text-ink placeholder:text-muted focus:border-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900';
const LABEL_CLASS = 'mb-2 block text-sm font-bold text-ink';
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function splitPreferences(value: string | null): {
  colour: string;
  size: string;
  model: string;
} {
  const parts = (value ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    colour: parts[0] ?? '',
    size: parts[1] ?? '',
    model: parts.slice(2).join(', '),
  };
}

export function GiftForm({
  gift,
  ownerMemberId,
  ownerName,
  returnHref = '/wishlist',
}: GiftFormProps) {
  const router = useRouter();
  const endpoint = ownerMemberId
    ? `/api/managed-members/${ownerMemberId}/gifts`
    : '/api/gifts';
  const initialPreferences = splitPreferences(gift?.preferences ?? null);
  const initialCurrency: CurrencyCode = isCurrencyCode(gift?.currency)
    ? gift.currency
    : DEFAULT_CURRENCY;

  const [name, setName] = useState(gift?.name ?? '');
  const [description, setDescription] = useState(gift?.description ?? '');
  const [price, setPrice] = useState(penceToPoundsInput(gift?.pricePence ?? null));
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency);
  const [colour, setColour] = useState(initialPreferences.colour);
  const [size, setSize] = useState(initialPreferences.size);
  const [model, setModel] = useState(initialPreferences.model);
  const [shopUrl, setShopUrl] = useState(gift?.shopUrl ?? '');
  const [imageUrl, setImageUrl] = useState(gift?.imageUrl ?? '');
  const [priority, setPriority] = useState(gift?.priority === PRIORITY_REALLY_WANT);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadError(null);

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setUploadError('Use a JPG, PNG or WebP photo.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setUploadError('That photo is too big. Choose one under 5 MB.');
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const uploadFile = await compressPhoto(file);
      const formData = new FormData();
      formData.append('file', uploadFile, uploadFile.name);
      const response = await fetch('/api/gift-photos', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as { ok?: boolean; url?: string; error?: string };

      if (!response.ok || !data.ok || !data.url) {
        setUploadError(data.error ?? 'We could not upload that photo just now.');
        return;
      }

      setImageUrl(data.url);
    } catch {
      setUploadError('We could not upload that photo just now. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const pricePence = poundsToPence(price);
    if (price.trim() !== '' && pricePence === null) {
      setError('Enter the price in pounds, like 95 or 95.50.');
      return;
    }

    if (uploading) {
      setError('Wait for the photo to finish uploading.');
      return;
    }

    const preferences =
      [colour, size, model]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(', ') || null;

    setSubmitting(true);

    try {
      const response = await fetch(gift ? `${endpoint}/${gift.id}` : endpoint, {
        method: gift ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description.trim() || null,
          currency,
          pricePence,
          shopUrl: shopUrl.trim() || null,
          imageUrl: imageUrl.trim() || null,
          preferences,
          priority,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? 'We could not save that gift just now. Please try again.');
        return;
      }

      // The API revalidates the server views, but the App Router can still
      // hold the prefetched wishlist page. Refresh after navigating so the
      // new gift is there immediately.
      router.push(returnHref);
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!gift) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${gift.id}`, { method: 'DELETE' });
      const data = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? 'We could not remove that gift just now.');
        return;
      }

      router.push(returnHref);
      router.refresh();
    } catch {
      setError('We could not reach the server. Check your connection and try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <span className={LABEL_CLASS}>
          Photo <span className="font-normal text-muted">(optional)</span>
        </span>

        {imageUrl ? (
          <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-snow">
            <Image
              src={imageUrl}
              alt="Gift photo preview"
              fill
              unoptimized
              sizes="(min-width: 640px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <label
          htmlFor="gift-photo"
          className={
            imageUrl
              ? 'mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-full border border-pine-100 px-4 text-sm font-bold text-ink hover:bg-pine-100/60 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pine-900'
              : 'flex h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pine-100 bg-snow text-muted transition-colors hover:border-pine-700/30 hover:text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pine-900'
          }
        >
          {imageUrl ? (
            <span>{uploading ? 'Uploading…' : 'Change photo'}</span>
          ) : (
            <>
              <CameraIcon className="h-7 w-7" />
              <span className="mt-2 text-sm font-bold">
                {uploading ? 'Uploading photo…' : 'Add a photo'}
              </span>
              <span className="mt-1 text-xs">JPG, PNG or WebP · up to 5 MB</span>
            </>
          )}
          <input
            id="gift-photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => void handlePhotoChange(event)}
            className="sr-only"
            aria-describedby={uploadError ? 'gift-photo-error' : undefined}
          />
        </label>

        {imageUrl ? (
          <button
            type="button"
            onClick={() => {
              setImageUrl('');
              setUploadError(null);
            }}
            className="ml-2 mt-2 inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold text-cranberry-ink hover:bg-cranberry/5 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
          >
            Remove photo
          </button>
        ) : null}

        {uploadError ? (
          <p
            id="gift-photo-error"
            role="alert"
            className="mt-2 flex items-start gap-2 text-sm text-cranberry-ink"
          >
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {uploadError}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="gift-name" className={LABEL_CLASS}>
          Gift name
        </label>
        <input
          id="gift-name"
          name="name"
          type="text"
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Nike Air Max Trainers"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="gift-description" className={LABEL_CLASS}>
          Description
        </label>
        <textarea
          id="gift-description"
          name="description"
          rows={3}
          maxLength={600}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="e.g. The classic ones, for everyday wear"
          className={`${INPUT_CLASS} resize-y`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gift-price" className={LABEL_CLASS}>
            Price
          </label>
          <input
            id="gift-price"
            name="price"
            type="text"
            inputMode="decimal"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="e.g. 95"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="gift-currency" className={LABEL_CLASS}>
            Currency
          </label>
          <select
            id="gift-currency"
            name="currency"
            value={currency}
            onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            className={INPUT_CLASS}
          >
            {CURRENCIES.map((option) => (
              <option key={option.code} value={option.code}>
                {option.code} {option.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="gift-size" className={LABEL_CLASS}>
            Size
          </label>
          <input
            id="gift-size"
            name="size"
            type="text"
            maxLength={40}
            value={size}
            onChange={(event) => setSize(event.target.value)}
            placeholder="e.g. 6"
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="gift-colour" className={LABEL_CLASS}>
            Colour
          </label>
          <input
            id="gift-colour"
            name="colour"
            type="text"
            maxLength={40}
            value={colour}
            onChange={(event) => setColour(event.target.value)}
            placeholder="e.g. Black"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="gift-model" className={LABEL_CLASS}>
          Model or other
        </label>
        <input
          id="gift-model"
          name="model"
          type="text"
          maxLength={100}
          value={model}
          onChange={(event) => setModel(event.target.value)}
          placeholder="e.g. Air Max 90"
          className={INPUT_CLASS}
        />
      </div>

      <div>
        <label htmlFor="gift-shop-url" className={LABEL_CLASS}>
          Shop link
        </label>
        <input
          id="gift-shop-url"
          name="shopUrl"
          type="url"
          maxLength={500}
          value={shopUrl}
          onChange={(event) => setShopUrl(event.target.value)}
          placeholder="e.g. https://www.nike.com/gb/…"
          className={INPUT_CLASS}
        />
      </div>

      <label
        htmlFor="gift-priority"
        className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-cranberry/10 px-5 py-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-pine-900"
      >
        <span className="inline-flex items-center gap-2 text-base font-bold text-cranberry-ink">
          <StarIcon className="h-4 w-4" />
          Really want this
        </span>
        <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center">
          <input
            id="gift-priority"
            name="priority"
            type="checkbox"
            checked={priority}
            onChange={(event) => setPriority(event.target.checked)}
            className="peer h-7 w-7 appearance-none rounded-md border-2 border-cranberry/40 bg-white checked:border-cranberry checked:bg-cranberry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
          />
          <svg
            className="pointer-events-none absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100"
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

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-2xl border border-cranberry/30 bg-cranberry/10 px-4 py-3 text-sm text-cranberry-ink"
        >
          <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="space-y-3 pt-2">
        <button
          type="submit"
          disabled={submitting || deleting || uploading}
          className="w-full rounded-full bg-cranberry px-6 py-4 text-base font-bold text-white transition-colors hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:cursor-wait disabled:opacity-70"
        >
          {submitting ? 'Saving…' : uploading ? 'Uploading photo…' : 'Save gift'}
        </button>
        <Link
          href={returnHref}
          className="block w-full rounded-full px-6 py-3 text-center text-sm font-bold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
        >
          Cancel
        </Link>
      </div>

      {gift ? (
        <div className="border-t border-pine-100 pt-5">
          {confirmingDelete ? (
            <div className="rounded-2xl border border-cranberry/25 bg-cranberry/5 p-4">
              <p className="text-sm font-semibold text-ink">
                Remove this gift from {ownerName ? `${ownerName}'s list` : 'your list'}?
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="min-h-11 rounded-full bg-cranberry px-5 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900 disabled:opacity-70"
                >
                  {deleting ? 'Removing…' : 'Yes, remove gift'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="min-h-11 rounded-full border border-pine-100 px-5 text-sm font-bold text-ink hover:bg-pine-100/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
                >
                  Keep it
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className="min-h-11 text-sm font-bold text-cranberry-ink underline underline-offset-4 hover:text-cranberry focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              Remove gift
            </button>
          )}
        </div>
      ) : null}
    </form>
  );
}
