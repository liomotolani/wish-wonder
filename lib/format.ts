import { DEFAULT_CURRENCY, isCurrencyCode, type CurrencyCode } from '@/lib/currencies';

const FORMATTERS = new Map<string, Intl.NumberFormat>();

function formatterFor(currency: CurrencyCode, withPence: boolean): Intl.NumberFormat {
  const key = `${currency}:${withPence ? 2 : 0}`;
  const cached = FORMATTERS.get(key);

  if (cached) {
    return cached;
  }

  const formatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: withPence ? 2 : 0,
    maximumFractionDigits: 2,
  });

  FORMATTERS.set(key, formatter);
  return formatter;
}

/** Format integer minor units in the gift's currency. */
export function formatPrice(
  minorUnits: number | null,
  currency: string = DEFAULT_CURRENCY,
): string | null {
  if (minorUnits === null) {
    return null;
  }

  const code = isCurrencyCode(currency) ? currency : DEFAULT_CURRENCY;
  const hasPence = minorUnits % 100 !== 0;

  return formatterFor(code, hasPence).format(minorUnits / 100);
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
