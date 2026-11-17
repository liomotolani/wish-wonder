const DAY_MS = 24 * 60 * 60 * 1000;

interface LondonDateParts {
  year: number;
  month: number;
  day: number;
}

function londonDateParts(now: Date): LondonDateParts {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
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

/** Today's date in London as `YYYY-MM-DD`, for once-a-day checks on the client. */
export function londonDateKey(now: Date = new Date()): string {
  const { year, month, day } = londonDateParts(now);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Milliseconds until the next midnight in London, so the countdown flips at
 * the same moment the calendar day changes for the family.
 */
export function msUntilNextLondonMidnight(now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
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

  // London's wall clock read as if it were UTC, then shifted back to a real
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

/**
 * Whole days from today until Christmas Day in London. Returns 0 on the day,
 * then counts down to next year's Christmas from Boxing Day onwards.
 */
export function daysUntilChristmas(now: Date = new Date()): number {
  const today = londonDateParts(now);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  let christmasUtc = Date.UTC(today.year, 11, 25);

  if (todayUtc > christmasUtc) {
    christmasUtc = Date.UTC(today.year + 1, 11, 25);
  }

  return Math.round((christmasUtc - todayUtc) / DAY_MS);
}

/** The Christmas year the current app year is preparing for. */
export function christmasYear(now: Date = new Date()): number {
  const today = londonDateParts(now);
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const christmasUtc = Date.UTC(today.year, 11, 25);

  return todayUtc > christmasUtc ? today.year + 1 : today.year;
}
