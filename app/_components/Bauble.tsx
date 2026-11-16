const TONES = ['rose', 'mint', 'gold'] as const;

type BaubleTone = (typeof TONES)[number];

interface BaubleProps {
  name: string;
  className?: string;
}

function toneForName(name: string): BaubleTone {
  const first = name.charCodeAt(0) || 0;
  return TONES[first % TONES.length];
}

const TONE_STYLES: Record<BaubleTone, string> = {
  rose: 'bg-cranberry/15 text-cranberry-ink',
  mint: 'bg-pine-100 text-pine-700',
  gold: 'bg-gold-100 text-gold-ink',
};

export function Bauble({ name, className = '' }: BaubleProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <span
      className={`inline-flex flex-col items-center ${className}`}
      aria-hidden="true"
    >
      <span className="mb-0.5 h-1.5 w-3 rounded-[2px] bg-gold" />
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-extrabold ${TONE_STYLES[toneForName(name)]}`}
      >
        {initial}
      </span>
    </span>
  );
}
