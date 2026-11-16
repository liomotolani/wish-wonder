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
