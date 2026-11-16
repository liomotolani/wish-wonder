import 'server-only';
import { createHash, randomBytes } from 'node:crypto';

export const SESSION_COOKIE_NAME = 'ww_member';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const DEVICE_LINK_TTL_SECONDS = 15 * 60;
export const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

/** A 256-bit personal link token, URL-safe. */
export function createPersonalToken(): string {
  return randomBytes(32).toString('base64url');
}

/** A one-time device-link token, URL-safe. */
export function createDeviceLinkToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Store only this hash; the raw token never goes into the database. */
export function hashPersonalToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function isPersonalTokenFormat(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

/** 16 hex characters, around 64 bits of randomness, for the shared invite link. */
export function createInviteCode(): string {
  return randomBytes(8).toString('hex');
}

/** A positive 48-bit seed for one picker visit's shuffle. */
export function createPickerSeed(): number {
  return randomBytes(6).readUIntBE(0, 6);
}
