import { NextResponse } from 'next/server';
import { redeemDeviceLinkRecord } from '@/lib/db/device-links';
import {
  addGroupSessionCookie,
  getAppBaseUrlFromRequest,
  isSecureRequest,
} from '@/lib/session';
import {
  createPersonalToken,
  hashPersonalToken,
  isPersonalTokenFormat,
} from '@/lib/tokens';

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const { token } = await context.params;

  if (!isPersonalTokenFormat(token)) {
    return redirectToExpired(request);
  }

  const sessionToken = createPersonalToken();

  try {
    const result = await redeemDeviceLinkRecord(
      hashPersonalToken(token),
      hashPersonalToken(sessionToken),
    );

    if (!result.ok) {
      return redirectToExpired(request);
    }

    const destination = result.memberStatus === 'pending' ? '/pending' : '/family';
    const response = NextResponse.redirect(
      new URL(destination, getAppBaseUrlFromRequest(request)),
    );
    response.headers.set('Cache-Control', 'no-store');
    addGroupSessionCookie(
      response,
      request,
      result.familyId,
      sessionToken,
      isSecureRequest(request),
    );
    return response;
  } catch {
    console.error('Could not use device link.');
    return redirectToExpired(request);
  }
}

function redirectToExpired(request: Request): NextResponse {
  const response = NextResponse.redirect(
    new URL('/link-expired', getAppBaseUrlFromRequest(request)),
  );
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
