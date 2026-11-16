import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  noStoreJson,
  readJsonBody,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import { createGiftRecord } from '@/lib/db/gifts';
import { getManagedMember } from '@/lib/db/members';
import {
  formatValidationError,
  giftInputSchema,
} from '@/lib/validation';

const idSchema = z.uuid('That list is not valid.');

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (!auth.viewer.event) {
    return apiError('There is no active Christmas list to add to yet.', 409);
  }

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('That list could not be found.', 404);
  }

  const managed = await getManagedMember(
    parsedId.data,
    auth.viewer.member.id,
    auth.viewer.family.id,
  );

  if (!managed) {
    return apiError('That list could not be found.', 404);
  }

  const body = await readJsonBody(request);
  const parsed = giftInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  try {
    const giftId = await createGiftRecord(
      auth.viewer.event.id,
      managed.id,
      parsed.data,
    );

    revalidateViews(
      '/wishlist',
      `/wishlist/managed/${managed.id}`,
      '/family',
    );
    return noStoreJson({ ok: true, giftId }, { status: 201 });
  } catch {
    console.error('Could not create managed gift.');
    return apiError('We could not save that gift just now. Please try again.', 500);
  }
}
