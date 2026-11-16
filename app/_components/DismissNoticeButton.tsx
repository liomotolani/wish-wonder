'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CloseIcon } from '@/app/_components/icons';

interface DismissNoticeButtonProps {
  noticeId: string;
}

export function DismissNoticeButton({ noticeId }: DismissNoticeButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function dismiss() {
    setBusy(true);

    try {
      await fetch(`/api/notices/${noticeId}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={dismiss}
      disabled={busy}
      aria-label="Dismiss notice"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-pine-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine-900"
    >
      <CloseIcon className="h-4 w-4" />
    </button>
  );
}
