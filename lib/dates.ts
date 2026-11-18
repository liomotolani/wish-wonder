const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_TIME_ZONE = 'Europe/London';

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function dateParts(now: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    return part ? Number(part.value) : 0;
  };

  return { year: value('year'), month: value('month'), day: value('day') };
}

/** Today's date in a timezone as `YYYY-MM-DD`, for once-a-day checks. */
export function dateKeyInTimeZone(
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE,
): string {
  const { year, month, day } = dateParts(now, timeZone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Kept for the existing London defaults; prefer dateKeyInTimeZone. */
export function londonDateKey(now: Date = new Date()): string {
  return dateKeyInTimeZone(now, DEFAULT_TIME_ZONE);
}

/**
 * Milliseconds until the next midnight in a timezone, so the countdown flips
 * when that device's calendar day turns over.
 */
export function msUntilNextMidnight(
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE,
): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((candidate) => candidate.type === type);
    return part ? Number(part.value) : 0;
  };

  // The local wall clock read as if it were UTC, then shifted back to a real
  // instant. This keeps daylight saving hours out of the arithmetic.
  const wallClockAsUtc = Date.UTC(
    value('year'),
    value('month') - 1,
    value('day'),
    value('hour'),
    value('minute'),
    value('second'),
  );
  const offset = wallClockAsUtc - now.getTime();
  const nextMidnightAsUtc = Date.UTC(value('year'), value('month') - 1, value('day') + 1);

  return Math.max(0, nextMidnightAsUtc - offset - now.getTime());
}

/** Kept for existing callers; pass a timezone to msUntilNextMidnight instead. */
export function msUntilNextLondonMidnight(now: Date = new Date()): number {
  return msUntilNextMidnight(now, DEFAULT_TIME_ZONE);
}

/**
 * Whole days from today until Christmas Day in the given timezone. Returns 0
 * on the day, then counts down to next year's Christmas from Boxing Day.
 */
export function daysUntilChristmas(
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE,
): number {
  const today = dateParts(now, timeZone);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  let christmasUtc = Date.UTC(today.year, 11, 25);

  if (todayUtc > christmasUtc) {
    christmasUtc = Date.UTC(today.year + 1, 11, 25);
  }

  return Math.round((christmasUtc - todayUtc) / DAY_MS);
}

/** The Christmas year the current app year is preparing for. */
export function christmasYear(
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE,
): number {
  const today = dateParts(now, timeZone);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const christmasUtc = Date.UTC(today.year, 11, 25);

  return todayUtc > christmasUtc ? today.year + 1 : today.year;
}
