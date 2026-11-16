import { NextResponse } from 'next/server';
import { getViewerByToken } from '@/lib/auth';
import {
  getAppBaseUrlFromRequest,
  isSecureRequest,
  setSessionCookie,
} from '@/lib/session';

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { token } = await context.params;
  const viewer = await getViewerByToken(token);

  const baseUrl = getAppBaseUrlFromRequest(request);

  if (!viewer) {
    const missing = NextResponse.redirect(new URL('/link-expired', baseUrl));
    missing.headers.set('Cache-Control', 'no-store');
    return missing;
  }

  const destination = viewer.member.status === 'pending' ? '/pending' : '/family';
  const response = NextResponse.redirect(new URL(destination, baseUrl));
  response.headers.set('Cache-Control', 'no-store');
  setSessionCookie(response, token, isSecureRequest(request));
  return response;
}
