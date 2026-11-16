const GBP_FORMATTER = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const GBP_FORMATTER_WITH_PENCE = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format integer pence as GBP. Whole pounds show as £95; part pounds as £95.50. */
export function formatPrice(pence: number | null): string | null {
  if (pence === null) {
    return null;
  }

  return pence % 100 === 0
    ? GBP_FORMATTER.format(pence / 100)
    : GBP_FORMATTER_WITH_PENCE.format(pence / 100);
}

/** Format an ISO date as a British date, for example 25 December 2026. */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  }).format(new Date(isoDate));
}

/** Turn a free-text preferences field into short display chips. */
export function preferenceChips(preferences: string | null): string[] {
  if (!preferences) {
    return [];
  }

  return preferences
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4);
}
