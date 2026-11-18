'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CopyButton } from '@/app/_components/CopyButton';
import {
  AlertCircleIcon,
  ChevronLeftIcon,
  ClockIcon,
  DeviceIcon,
  LockIcon,
} from '@/app/_components/icons';
import type { DeviceLinkView } from '@/lib/types';

type PanelState = 'loading' | 'ready' | 'expired' | 'error';

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function QrBlock({
  qrSvg,
  remainingSeconds,
}: {
  qrSvg: string;
  remainingSeconds: number;
}) {
  return (
    <div className="rounded-[28px] bg-white p-4 text-center text-ink shadow-2xl">
      <div
        className="mx-auto aspect-square w-full max-w-[280px] [&_svg]:h-full [&_svg]:w-full"
        role="img"
        aria-label="QR code for signing in on another device"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold">
        <ClockIcon className="h-4 w-4" />
        Expires in {formatCountdown(remainingSeconds)}
      </p>
    </div>
  );
}

function LinkRow({ url, tone = 'dark' }: { url: string; tone?: 'dark' | 'light' }) {
  const isDark = tone === 'dark';

  return (
    <div className="flex items-stretch gap-2">
      <input
        type="text"
        readOnly
        value={url}
        aria-label="Device link"
        className={
          isDark
            ? 'min-w-0 flex-1 rounded-2xl border border-snow/25 bg-snow/10 px-4 py-3 text-sm text-snow/80 focus:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'
            : 'min-w-0 flex-1 rounded-2xl border border-pine-100 bg-snow px-4 py-3 text-sm text-ink focus:border-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900'
        }
      />
      <CopyButton
        value={url}
        label="Copy link"
        className={
          isDark
            ? 'inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-gold px-5 text-sm font-bold text-pine-900 transition-colors hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snow'
            : 'inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl bg-pine-900 px-5 text-sm font-bold text-snow transition-colors hover:bg-pine-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900'
        }
      />
    </div>
  );
}

function PrivacyNote({ dark = false }: { dark?: boolean }) {
  return (
    <p
      className={`flex items-start gap-2 text-sm leading-relaxed ${
        dark ? 'text-muted' : 'text-snow/65'
      }`}
    >
      <LockIcon
        className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-pine-700' : 'text-gold'}`}
      />
      This link works once, only for you. Don&apos;t share it with anyone else.
    </p>
  );
}

export function DeviceLinkPanel() {
  const [state, setState] = useState<PanelState>('loading');
  const [link, setLink] = useState<DeviceLinkView | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const requested = useRef(false);

  const createLink = useCallback(async () => {
    setState('loading');
    setLink(null);

    try {
      const response = await fetch('/api/me/device-link', { method: 'POST' });
      const data = (await response.json()) as DeviceLinkView & { error?: string };

      if (!response.ok || !data.url || !data.expiresAt || !data.qrSvg) {
        setState('error');
        return;
      }

      const secondsLeft = Math.max(
        0,
        Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000),
      );

      setLink(data);
      setRemainingSeconds(secondsLeft);
      setState(secondsLeft > 0 ? 'ready' : 'expired');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (requested.current) {
      return;
    }

    requested.current = true;
    void createLink();
  }, [createLink]);

  useEffect(() => {
    if (state !== 'ready') {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setState('expired');
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [state]);

  if (state === 'loading' || state === 'error') {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-8 sm:px-8">
        <div className="rounded-3xl border border-snow/10 bg-snow/[0.06] p-8 text-center">
          {state === 'loading' ? (
            <>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-snow/10 text-gold">
                <DeviceIcon className="h-7 w-7" />
              </span>
              <p className="mt-4 text-base font-bold">Making your one-time link…</p>
            </>
          ) : (
            <>
              <AlertCircleIcon className="mx-auto h-10 w-10 text-gold" />
              <p className="mt-4 text-base font-bold">We couldn&apos;t make that link</p>
              <p className="mt-1 text-sm text-snow/65">
                Check your connection and try again. Nothing has changed on this device.
              </p>
              <button
                type="button"
                onClick={() => void createLink()}
                className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-6 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Try again
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (state === 'expired' || !link) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-8 sm:px-8">
        <div className="rounded-3xl bg-white p-6 text-ink shadow-2xl sm:p-8">
          <ClockIcon className="h-10 w-10 text-cranberry-ink" />
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight">This link has expired</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Device links only last 15 minutes. Make a new one to sign in on your other device.
            You&apos;ll stay signed in here.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void createLink()}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-cranberry px-6 text-sm font-bold text-white hover:bg-cranberry-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              Create a new link
            </button>
            <Link
              href="/family"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-pine-100 px-6 text-sm font-bold text-ink hover:bg-pine-100/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-10 pt-6 sm:px-8 lg:hidden">
        <Link
          href="/family"
          aria-label="Back to Home"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-snow/10 text-snow transition-colors hover:bg-snow/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </Link>

        <div className="mt-8 flex flex-1 flex-col">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
            Use on another device
          </h1>
          <p className="mt-3 text-base leading-relaxed text-snow/70">
            Scan this with your laptop or tablet camera, or send yourself the link. You&apos;ll
            stay signed in here too.
          </p>

          <div className="mt-7">
            <QrBlock qrSvg={link.qrSvg} remainingSeconds={remainingSeconds} />
          </div>

          <div className="mt-5">
            <LinkRow url={link.url} />
          </div>

          <div className="mt-5">
            <PrivacyNote />
          </div>

          <Link
            href="/family"
            className="mt-auto flex min-h-14 w-full items-center justify-center rounded-full border border-snow/25 px-6 pt-0 text-base font-bold text-snow transition-colors hover:bg-snow/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Done
          </Link>
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-5xl flex-1 items-center px-6 py-12 lg:flex">
        <div className="grid w-full grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-8 rounded-[32px] bg-white p-6 text-ink shadow-2xl">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-snow p-6">
            <div
              className="aspect-square w-full max-w-[320px] [&_svg]:h-full [&_svg]:w-full"
              role="img"
              aria-label="QR code for signing in on another device"
              dangerouslySetInnerHTML={{ __html: link.qrSvg }}
            />
            <p className="mt-3 flex items-center gap-1.5 text-sm font-bold">
              <ClockIcon className="h-4 w-4" />
              Expires in {formatCountdown(remainingSeconds)}
            </p>
          </div>

          <div className="flex flex-col justify-center py-2">
            <Link
              href="/family"
              className="inline-flex min-h-11 w-fit items-center gap-1 text-sm font-bold text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
            >
              <ChevronLeftIcon className="h-4 w-4" />
              Back to Home
            </Link>

            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight">
              Use on another device
            </h1>
            <ol className="mt-4 space-y-2 text-base leading-relaxed text-muted">
              <li>1. Scan the code with your phone or tablet camera, or copy the link.</li>
              <li>2. Open it on the other device.</li>
              <li>3. You&apos;re signed in on both. Nothing changes here.</li>
            </ol>

            <div className="mt-5">
              <LinkRow url={link.url} tone="light" />
            </div>

            <div className="mt-4">
              <PrivacyNote dark />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
