import { NextResponse } from 'next/server';
import {
  apiError,
  noStoreJson,
  readJsonBody,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import { createGiftRecord } from '@/lib/db/gifts';
import {
  formatValidationError,
  giftInputSchema,
} from '@/lib/validation';

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (!auth.viewer.event) {
    return apiError('There is no active Christmas list to add to yet.', 409);
  }

  const body = await readJsonBody(request);
  const parsed = giftInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  try {
    const giftId = await createGiftRecord(
      auth.viewer.event.id,
      auth.viewer.member.id,
      parsed.data,
    );

    revalidateViews('/wishlist', '/family');
    return noStoreJson({ ok: true, giftId }, { status: 201 });
  } catch {
    console.error('Could not create gift.');
    return apiError('We could not save that gift just now. Please try again.', 500);
  }
}
