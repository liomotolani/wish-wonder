/**
 * The device's group sessions live in one cookie, keyed by family id, with the
 * active group named alongside them. Only raw personal-link tokens are stored:
 * the server hashes them for member_sessions and never stores anything else.
 *
 * This module is pure so the cookie shape can be unit-tested.
 */

export const DEVICE_SESSIONS_COOKIE_NAME = 'ww_groups';
export const DEVICE_SESSIONS_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const FAMILY_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MAX_SESSIONS = 30;

export interface DeviceSessions {
  /** The family id whose group is currently open. */
  active: string;
  /** family id → the raw personal-link token for this device. */
  sessions: Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFamilyId(value: string): boolean {
  return FAMILY_ID_PATTERN.test(value);
}

function isSessionToken(value: string): boolean {
  return TOKEN_PATTERN.test(value);
}

/** Encode for the cookie value. Base64url keeps it cookie-safe. */
export function encodeDeviceSessions(sessions: DeviceSessions): string {
  return Buffer.from(JSON.stringify(sessions), 'utf8').toString('base64url');
}

/** Parse a cookie value, dropping malformed groups rather than failing to sign in. */
export function parseDeviceSessions(value: string | undefined | null): DeviceSessions | null {
  if (!value) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!isRecord(parsed) || !isRecord(parsed.sessions)) {
    return null;
  }

  const sessions: Record<string, string> = {};

  for (const [familyId, token] of Object.entries(parsed.sessions)) {
    if (
      Object.keys(sessions).length >= MAX_SESSIONS ||
      !isFamilyId(familyId) ||
      typeof token !== 'string' ||
      !isSessionToken(token)
    ) {
      continue;
    }

    sessions[familyId] = token;
  }

  const familyIds = Object.keys(sessions);

  if (familyIds.length === 0) {
    return null;
  }

  const requestedActive =
    typeof parsed.active === 'string' && isFamilyId(parsed.active) ? parsed.active : null;

  return {
    active:
      requestedActive && sessions[requestedActive] ? requestedActive : familyIds[0],
    sessions,
  };
}

/** Add or replace one group's session and make it active. Never removes another. */
export function addDeviceSession(
  current: DeviceSessions | null,
  familyId: string,
  token: string,
): DeviceSessions {
  return {
    active: familyId,
    sessions: {
      ...(current?.sessions ?? {}),
      [familyId]: token,
    },
  };
}

/** Remove only this group's session, choosing another group as active if needed. */
export function removeDeviceSession(
  current: DeviceSessions | null,
  familyId: string,
): DeviceSessions | null {
  if (!current || !current.sessions[familyId]) {
    return current;
  }

  const sessions = { ...current.sessions };
  delete sessions[familyId];

  const familyIds = Object.keys(sessions);

  if (familyIds.length === 0) {
    return null;
  }

  return {
    active: current.active === familyId ? familyIds[0] : current.active,
    sessions,
  };
}

export function activeSessionToken(sessions: DeviceSessions | null): string | null {
  if (!sessions) {
    return null;
  }

  return sessions.sessions[sessions.active] ?? Object.values(sessions.sessions)[0] ?? null;
}

export function switchActiveDeviceSession(
  current: DeviceSessions | null,
  familyId: string,
): DeviceSessions | null {
  if (!current || !current.sessions[familyId]) {
    return current;
  }

  return { ...current, active: familyId };
}

/** Read one cookie by name from a raw Cookie header. */
export function readCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');

    if (separator === -1) {
      continue;
    }

    if (part.slice(0, separator).trim() !== name) {
      continue;
    }

    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
}
