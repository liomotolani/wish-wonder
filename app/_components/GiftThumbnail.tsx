import Image from 'next/image';
import { GiftIcon } from '@/app/_components/icons';

const TONES = [
  'bg-pine-100 text-pine-700',
  'bg-cranberry/10 text-cranberry-ink',
  'bg-gold-100 text-gold-ink',
] as const;

function toneForId(id: string): (typeof TONES)[number] {
  const total = Array.from(id).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return TONES[total % TONES.length];
}

interface GiftThumbnailProps {
  giftId: string;
  imageUrl: string | null;
  className?: string;
  toneIndex?: number;
}

export function GiftThumbnail({
  giftId,
  imageUrl,
  className = '',
  toneIndex,
}: GiftThumbnailProps) {
  const tone =
    toneIndex === undefined ? toneForId(giftId) : TONES[toneIndex % TONES.length];

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl ${tone} ${className}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 280px, 72px"
          className="object-cover"
        />
      ) : (
        <GiftIcon className="h-7 w-7" />
      )}
    </span>
  );
}
