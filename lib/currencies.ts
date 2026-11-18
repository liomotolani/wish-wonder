/**
 * Currencies a gift price can use. Each has two decimal places, matching the
 * integer minor-unit storage in gifts.price_pence.
 */
export const CURRENCIES = [
  { code: 'GBP', name: 'British pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US dollar', symbol: 'US$' },
  { code: 'AUD', name: 'Australian dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian dollar', symbol: 'C$' },
  { code: 'NZD', name: 'New Zealand dollar', symbol: 'NZ$' },
  { code: 'CHF', name: 'Swiss franc', symbol: 'CHF' },
  { code: 'SGD', name: 'Singapore dollar', symbol: 'S$' },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]['code'];

export const DEFAULT_CURRENCY: CurrencyCode = 'GBP';

export const CURRENCY_CODES = CURRENCIES.map((currency) => currency.code) as [
  CurrencyCode,
  ...CurrencyCode[],
];

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return (
    typeof value === 'string' &&
    CURRENCIES.some((currency) => currency.code === value)
  );
}

export function currencyName(code: CurrencyCode): string {
  return CURRENCIES.find((currency) => currency.code === code)?.name ?? code;
}
