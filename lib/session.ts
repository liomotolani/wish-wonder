import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextResponse } from 'next/server';
import { getViewerByToken } from '@/lib/auth';
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  WELCOME_COOKIE_NAME,
  WELCOME_MAX_AGE_SECONDS,
} from '@/lib/tokens';
import type { Viewer } from '@/lib/types';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);

/** Resolve the viewer once per request, even if several components ask. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return getViewerByToken(token);
});

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();

  if (!viewer) {
    redirect('/');
  }

  if (viewer.member.status === 'pending') {
    redirect('/pending');
  }

  return viewer;
}

function normaliseBaseUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    // A leftover localhost value must not be shown to a phone or deployed host.
    if (LOCAL_HOSTS.has(parsed.hostname)) {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

/**
 * The canonical public base URL. NEXT_PUBLIC_APP_URL wins when it is a real
 * public URL; otherwise use the host that served this request, which keeps
 * LAN, preview and custom-domain links working.
 */
export async function getAppBaseUrl(): Promise<string> {
  const configured = normaliseBaseUrl(process.env.NEXT_PUBLIC_APP_URL);

  if (configured) {
    return configured;
  }

  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');

  if (host) {
    const forwardedProto = headerStore
      .get('x-forwarded-proto')
      ?.split(',')[0]
      ?.trim();

    return `${forwardedProto ?? 'http'}://${host}`;
  }

  return 'http://localhost:3000';
}

/** Route-handler version of getAppBaseUrl that does not need next/headers. */
export function getAppBaseUrlFromRequest(request: Request): string {
  const configured = normaliseBaseUrl(process.env.NEXT_PUBLIC_APP_URL);

  if (configured) {
    return configured;
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost ?? request.headers.get('host');
  const forwardedProto = request.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim();

  let protocol = forwardedProto;

  if (!protocol) {
    try {
      protocol = new URL(request.url).protocol.replace(':', '');
    } catch {
      protocol = 'http';
    }
  }

  if (host) {
    return `${protocol}://${host}`;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return 'http://localhost:3000';
  }
}

export function isSecureRequest(request: Request): boolean {
  const forwardedProto = request.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim();

  if (forwardedProto) {
    return forwardedProto === 'https';
  }

  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return process.env.NODE_ENV === 'production';
  }
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  secure: boolean = process.env.NODE_ENV === 'production',
): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Mark the next dashboard visit as a first visit. */
export function setWelcomeCookie(
  response: NextResponse,
  secure: boolean = process.env.NODE_ENV === 'production',
): void {
  response.cookies.set({
    name: WELCOME_COOKIE_NAME,
    value: '1',
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    maxAge: WELCOME_MAX_AGE_SECONDS,
  });
}
