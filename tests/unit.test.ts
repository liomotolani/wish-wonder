import { describe, expect, it } from 'vitest';
import {
  daysUntilChristmas,
  christmasYear,
  dateKeyInTimeZone,
  londonDateKey,
  msUntilNextLondonMidnight,
  msUntilNextMidnight,
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
import {
  countdownAccessibleLabel,
  countdownLabel,
  countdownMilestone,
  rollSequence,
} from '@/lib/countdown';

describe('prices and copy helpers', () => {
  it('formats whole pounds without pence', () => {
    expect(formatPrice(9500)).toBe('£95');
    expect(formatPrice(0)).toBe('£0');
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice(9500, 'USD')).toBe('US$95');
    expect(formatPrice(9550, 'AUD')).toBe('A$95.50');
    expect(formatPrice(9500, 'not-a-currency')).toBe('£95');
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

  it('keys days by the London calendar, not UTC', () => {
    expect(londonDateKey(new Date('2026-11-17T00:30:00Z'))).toBe('2026-11-17');
    expect(londonDateKey(new Date('2026-07-01T23:30:00Z'))).toBe('2026-07-02');
  });

  it('waits until London midnight through both GMT and BST', () => {
    expect(msUntilNextLondonMidnight(new Date('2026-11-17T12:00:00Z'))).toBe(12 * 60 * 60 * 1000);
    expect(msUntilNextLondonMidnight(new Date('2026-07-01T12:00:00Z'))).toBe(11 * 60 * 60 * 1000);
    expect(msUntilNextLondonMidnight(new Date('2026-11-17T23:59:30Z'))).toBe(30 * 1000);
  });

  it('follows the visitor timezone when one is supplied', () => {
    const instant = new Date('2026-12-24T20:00:00Z');

    expect(daysUntilChristmas(instant, 'Europe/London')).toBe(1);
    expect(daysUntilChristmas(instant, 'Australia/Sydney')).toBe(0);
    expect(dateKeyInTimeZone(instant, 'Europe/London')).toBe('2026-12-24');
    expect(dateKeyInTimeZone(instant, 'Australia/Sydney')).toBe('2026-12-25');
    expect(msUntilNextMidnight(new Date('2026-11-17T12:00:00Z'), 'Australia/Sydney')).toBe(
      60 * 60 * 1000,
    );
  });
});

describe('countdown board', () => {
  it('rolls down through odd values before landing', () => {
    expect(rollSequence(38)).toEqual([45, 43, 41, 39, 38]);
  });

  it('lands on the real day from a single digit too', () => {
    const sequence = rollSequence(7);
    expect(sequence.at(-1)).toBe(7);
    expect(sequence.length).toBeGreaterThan(1);
  });

  it('adds the milestone copy under the number', () => {
    expect(countdownMilestone(25)).toBeNull();
    expect(countdownMilestone(24)).toBe('Advent is here');
    expect(countdownMilestone(8)).toBe('Advent is here');
    expect(countdownMilestone(7)).toBe('One week to go!');
    expect(countdownMilestone(3)).toBe('One week to go!');
    expect(countdownMilestone(2)).toBe('Christmas Eve tomorrow!');
    expect(countdownMilestone(1)).toBe("It's Christmas Eve!");
    expect(countdownMilestone(0)).toBeNull();
  });

  it('names the countdown once for screen readers', () => {
    expect(countdownAccessibleLabel(38)).toBe('38 days until Christmas');
    expect(countdownAccessibleLabel(1)).toBe('1 day until Christmas');
    expect(countdownAccessibleLabel(0)).toBe("It's Christmas Day");
    expect(countdownLabel(1)).toBe('day until Christmas Day');
    expect(countdownLabel(0)).toBe("It's Christmas Day!");
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
