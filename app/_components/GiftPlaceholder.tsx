interface GiftPlaceholderProps {
  className?: string;
}

/**
 * A festive wrapped gift for gifts without a photo. Decorative: the gift name
 * beside it carries the meaning for screen readers.
 */
export function GiftPlaceholder({ className = '' }: GiftPlaceholderProps) {
  return (
    <span
      data-gift-placeholder="true"
      className={`absolute inset-0 flex items-center justify-center overflow-hidden bg-snow ${className}`}
      aria-hidden="true"
    >
      <span className="snow-dots-soft pointer-events-none absolute inset-0 opacity-60" />
      <span className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-gold/20" />
      <span className="pointer-events-none absolute -bottom-14 -left-12 h-44 w-44 rounded-full bg-cranberry/10" />
      <svg
        className="relative h-32 w-32 sm:h-40 sm:w-40"
        viewBox="0 0 200 200"
        fill="none"
      >
        <ellipse cx="100" cy="174" rx="58" ry="10" fill="var(--color-ink)" opacity="0.08" />
        <rect
          x="42"
          y="86"
          width="116"
          height="82"
          rx="16"
          fill="var(--color-cranberry)"
        />
        <rect
          x="32"
          y="68"
          width="136"
          height="32"
          rx="12"
          fill="var(--color-cranberry-ink)"
        />
        <rect x="92" y="68" width="16" height="100" fill="var(--color-gold)" />
        <rect x="32" y="78" width="136" height="12" fill="var(--color-gold)" opacity="0.95" />
        <path
          d="M100 76c-13-22-42-18-37 4 4 17 37 17 37 17s33 0 37-17c5-22-24-26-37-4Z"
          fill="var(--color-gold)"
          stroke="var(--color-cranberry-ink)"
          strokeWidth="4"
        />
        <path
          d="M100 76v20"
          stroke="var(--color-cranberry-ink)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="m158 34 3 9 9 3-9 3-3 9-3-9-9-3 9-3 3-9Z"
          fill="var(--color-gold)"
        />
        <path
          d="m44 40 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z"
          fill="var(--color-gold)"
          opacity="0.8"
        />
      </svg>
    </span>
  );
}
