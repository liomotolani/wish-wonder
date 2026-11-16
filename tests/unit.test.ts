import { describe, expect, it } from 'vitest';
import {
  daysUntilChristmas,
  christmasYear,
} from '@/lib/dates';
import {
  formatPrice,
  preferenceChips,
} from '@/lib/format';
import { shuffleGiftIds } from '@/lib/picker-shuffle';
import {
  extractInviteCode,
  poundsToPence,
  penceToPoundsInput,
} from '@/lib/validation';
import { DURATION, SPARKLE } from '@/app/_components/motion/presets';

describe('prices and copy helpers', () => {
  it('formats whole pounds without pence', () => {
    expect(formatPrice(9500)).toBe('£95');
    expect(formatPrice(0)).toBe('£0');
    expect(formatPrice(null)).toBeNull();
  });

  it('formats part pounds with pence', () => {
    expect(formatPrice(9550)).toBe('£95.50');
    expect(formatPrice(1)).toBe('£0.01');
  });

  it('parses pounds into integer pence', () => {
    expect(poundsToPence('95')).toBe(9500);
    expect(poundsToPence('95.5')).toBe(9550);
    expect(poundsToPence('95.50')).toBe(9550);
    expect(poundsToPence('')).toBeNull();
    expect(poundsToPence('9.999')).toBeNull();
    expect(poundsToPence('-1')).toBeNull();
  });

  it('renders pence back into a pounds input', () => {
    expect(penceToPoundsInput(9500)).toBe('95');
    expect(penceToPoundsInput(9550)).toBe('95.50');
    expect(penceToPoundsInput(null)).toBe('');
  });

  it('turns preferences into short chips', () => {
    expect(preferenceChips('Black, Size 6, , Air Max')).toEqual([
      'Black',
      'Size 6',
      'Air Max',
    ]);
    expect(preferenceChips(null)).toEqual([]);
  });
});

describe('reveal timing', () => {
  it('starts without a visible pause', () => {
    expect(DURATION.reveal.lead).toBeLessThanOrEqual(0.05);
  });

  it('lets every sparkle finish before the scene settles', () => {
    const lastSparkleEnd =
      DURATION.reveal.lead +
      DURATION.reveal.sparkleDelay +
      (SPARKLE.count - 1) * DURATION.sparkleStep +
      DURATION.sparkle;

    expect(lastSparkleEnd).toBeLessThanOrEqual(DURATION.reveal.total);
  });

  it('lets the gift card and lid settle before the scene budget', () => {
    const cardEnd =
      DURATION.reveal.lead + DURATION.reveal.cardDelay + DURATION.reveal.card;
    const lidEnd =
      DURATION.reveal.lead + DURATION.reveal.lidDelay + DURATION.reveal.lid;

    expect(cardEnd).toBeLessThanOrEqual(DURATION.reveal.total);
    expect(lidEnd).toBeLessThanOrEqual(DURATION.reveal.total);
  });

  it('answers a tile tap inside a quarter of a second', () => {
    expect(DURATION.tileShake).toBeLessThanOrEqual(0.25);
  });
});

describe('Christmas countdown', () => {
  it('counts whole days from a November date', () => {
    expect(daysUntilChristmas(new Date('2026-11-16T12:00:00Z'))).toBe(39);
  });

  it('is zero on Christmas Day', () => {
    expect(daysUntilChristmas(new Date('2026-12-25T12:00:00Z'))).toBe(0);
  });

  it('counts to next Christmas from Boxing Day', () => {
    expect(daysUntilChristmas(new Date('2026-12-26T12:00:00Z'))).toBe(364);
    expect(christmasYear(new Date('2026-12-26T12:00:00Z'))).toBe(2027);
  });
});

describe('picker shuffle', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  it('is deterministic for the same seed', () => {
    expect(shuffleGiftIds(ids, 42)).toEqual(shuffleGiftIds(ids, 42));
  });

  it('keeps every gift exactly once', () => {
    const shuffled = shuffleGiftIds(ids, 99);
    expect([...shuffled].sort()).toEqual([...ids].sort());
  });

  it('changes the order for a different seed', () => {
    expect(shuffleGiftIds(ids, 42)).not.toEqual(shuffleGiftIds(ids, 43));
  });

  it('does not mutate the input', () => {
    const input = [...ids];
    shuffleGiftIds(input, 7);
    expect(input).toEqual(ids);
  });
});

describe('invite links', () => {
  const code = '0a1b2c3d4e5f6a7b';

  it('extracts a code from a full invite link', () => {
    expect(extractInviteCode(`https://wishandwonder.app/join/${code}`)).toBe(code);
    expect(extractInviteCode(`http://localhost:3000/join/${code}?x=1`)).toBe(code);
  });

  it('accepts a pasted code', () => {
    expect(extractInviteCode(code)).toBe(code);
  });

  it('rejects anything else', () => {
    expect(extractInviteCode('not-a-link')).toBeNull();
    expect(extractInviteCode('https://wishandwonder.app/join/123')).toBeNull();
  });
});
