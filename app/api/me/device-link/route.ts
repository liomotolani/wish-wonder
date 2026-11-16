import { NextResponse } from 'next/server';
import {
  apiError,
  noStoreJson,
  requireApiViewer,
} from '@/lib/api';
import { createDeviceLinkRecord } from '@/lib/db/device-links';
import { createQrSvg } from '@/lib/qr';
import { getAppBaseUrlFromRequest } from '@/lib/session';
import {
  DEVICE_LINK_TTL_SECONDS,
  createDeviceLinkToken,
  hashPersonalToken,
} from '@/lib/tokens';

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  const token = createDeviceLinkToken();
  const expiresAt = new Date(Date.now() + DEVICE_LINK_TTL_SECONDS * 1000).toISOString();

  try {
    await createDeviceLinkRecord({
      memberId: auth.viewer.member.id,
      tokenHash: hashPersonalToken(token),
      expiresAt,
    });

    const url = `${getAppBaseUrlFromRequest(request)}/device/${token}`;
    const qrSvg = await createQrSvg(url);

    return noStoreJson({ url, expiresAt, qrSvg });
  } catch {
    console.error('Could not create device link.');
    return apiError('We could not make that link just now. Please try again.', 500);
  }
}
