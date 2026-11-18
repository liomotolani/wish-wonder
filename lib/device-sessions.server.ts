import 'server-only';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import {
  DEVICE_SESSIONS_COOKIE_NAME,
  DEVICE_SESSIONS_MAX_AGE_SECONDS,
  encodeDeviceSessions,
  parseDeviceSessions,
  readCookieValue,
  type DeviceSessions,
} from '@/lib/device-sessions';
import { SESSION_COOKIE_NAME } from '@/lib/tokens';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: DEVICE_SESSIONS_MAX_AGE_SECONDS,
};

/** The groups this device remembers, read inside a Server Component or Action. */
export async function readDeviceSessions(): Promise<DeviceSessions | null> {
  const cookieStore = await cookies();
  return parseDeviceSessions(cookieStore.get(DEVICE_SESSIONS_COOKIE_NAME)?.value);
}

/** Route-handler version that reads from the incoming request. */
export function readDeviceSessionsFromRequest(request: Request): DeviceSessions | null {
  return parseDeviceSessions(
    readCookieValue(request.headers.get('cookie'), DEVICE_SESSIONS_COOKIE_NAME),
  );
}

export function readLegacySessionTokenFromRequest(request: Request): string | null {
  return readCookieValue(request.headers.get('cookie'), SESSION_COOKIE_NAME);
}

export function writeDeviceSessionsToResponse(
  response: NextResponse,
  sessions: DeviceSessions | null,
  secure: boolean,
): void {
  if (!sessions) {
    response.cookies.delete(DEVICE_SESSIONS_COOKIE_NAME);
    return;
  }

  response.cookies.set({
    name: DEVICE_SESSIONS_COOKIE_NAME,
    value: encodeDeviceSessions(sessions),
    ...COOKIE_OPTIONS,
    secure,
  });
}

/** Server Actions can write to the request's own cookie jar. */
export async function writeDeviceSessionsToCookieJar(
  sessions: DeviceSessions | null,
): Promise<void> {
  const cookieStore = await cookies();

  if (!sessions) {
    cookieStore.delete(DEVICE_SESSIONS_COOKIE_NAME);
    return;
  }

  cookieStore.set({
    name: DEVICE_SESSIONS_COOKIE_NAME,
    value: encodeDeviceSessions(sessions),
    ...COOKIE_OPTIONS,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function readLegacySessionTokenFromCookieJar(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}
