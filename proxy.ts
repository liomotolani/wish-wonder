import { NextResponse, type NextRequest } from 'next/server';
import {
  addDeviceSession,
  parseDeviceSessions,
  DEVICE_SESSIONS_COOKIE_NAME,
  DEVICE_SESSIONS_MAX_AGE_SECONDS,
} from '@/lib/device-sessions';
import { SESSION_COOKIE_NAME } from '@/lib/tokens';

/**
 * Move the old single-group cookie into the multi-group cookie so anyone who
 * was signed in before this shipped stays signed in. Runs in the Node runtime.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const legacyToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!legacyToken) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  try {
    // Load the database client only for the one-off migration request.
    const { getViewerByToken } = await import('@/lib/auth');
    const viewer = await getViewerByToken(legacyToken);

    if (viewer) {
      const existing = parseDeviceSessions(
        request.cookies.get(DEVICE_SESSIONS_COOKIE_NAME)?.value,
      );
      const sessions = existing?.sessions[viewer.family.id]
        ? { ...existing, active: viewer.family.id }
        : addDeviceSession(existing, viewer.family.id, legacyToken);
      const secure =
        request.nextUrl.protocol === 'https:' ||
        request.headers.get('x-forwarded-proto') === 'https';

      response.cookies.set({
        name: DEVICE_SESSIONS_COOKIE_NAME,
        value: Buffer.from(JSON.stringify(sessions), 'utf8').toString('base64url'),
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: DEVICE_SESSIONS_MAX_AGE_SECONDS,
      });
    }

    // The old cookie has been copied across, or it no longer resolves.
    response.cookies.delete(SESSION_COOKIE_NAME);
  } catch {
    // If the lookup fails, leave the old cookie alone so nobody is signed out.
    return NextResponse.next();
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|webp|svg|ico|woff2?)$).*)',
  ],
};
