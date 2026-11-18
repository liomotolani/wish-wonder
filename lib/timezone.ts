import 'server-only';
import { headers } from 'next/headers';
import { DEFAULT_TIME_ZONE } from '@/lib/dates';

/** Vercel tells us the visitor's IANA timezone from their IP. */
export const TIME_ZONE_HEADER = 'x-vercel-ip-timezone';

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

/**
 * The timezone for this request. On Vercel this comes from the edge's IP
 * lookup; local and other hosts fall back to the PRD's London clock.
 */
export async function getRequestTimeZone(): Promise<string> {
  const headerStore = await headers();
  const candidate = headerStore.get(TIME_ZONE_HEADER)?.trim();

  if (candidate && isValidTimeZone(candidate)) {
    return candidate;
  }

  return DEFAULT_TIME_ZONE;
}
