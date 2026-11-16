'use client';

import { useState } from 'react';
import { CopyIcon } from '@/app/_components/icons';

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('Copy failed');
  }
}

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}

const DEFAULT_CLASS =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-bold text-pine-900 transition-colors hover:bg-gold/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-snow disabled:opacity-60';

export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  className = DEFAULT_CLASS,
}: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  async function handleCopy() {
    try {
      await copyText(value);
      setStatus('copied');
      window.setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={handleCopy} className={className}>
        <CopyIcon className="h-4 w-4" />
        {status === 'copied' ? copiedLabel : label}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status === 'copied' ? 'Link copied to clipboard.' : ''}
        {status === 'error' ? 'Could not copy the link. Select it and copy manually.' : ''}
      </span>
    </span>
  );
}

interface ShareFamilyLinkProps {
  url: string;
  familyName: string;
  className?: string;
  label?: string;
}

export function ShareFamilyLink({
  url,
  familyName,
  className = '',
  label = 'Share link',
}: ShareFamilyLinkProps) {
  const [status, setStatus] = useState<'idle' | 'shared' | 'copied' | 'error'>('idle');

  async function handleShare() {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: `Join ${familyName} on Wish & Wonder`,
          text: `Join our family wish list: ${familyName}`,
          url,
        });
        setStatus('shared');
        window.setTimeout(() => setStatus('idle'), 2500);
        return;
      }

      await copyText(url);
      setStatus('copied');
      window.setTimeout(() => setStatus('idle'), 2500);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      setStatus('error');
    }
  }

  const buttonLabel =
    status === 'copied' ? 'Link copied' : status === 'shared' ? 'Shared' : label;

  return (
    <>
      <button type="button" onClick={handleShare} className={className}>
        {buttonLabel}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {status === 'shared' ? 'Invite shared.' : ''}
        {status === 'copied' ? 'Invite link copied to clipboard.' : ''}
        {status === 'error' ? 'Could not share the link. Try copying it instead.' : ''}
      </span>
    </>
  );
}
