import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  noStoreJson,
  readJsonBody,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import {
  deleteOwnGiftRecord,
  updateOwnGiftRecord,
} from '@/lib/db/gifts';
import {
  formatValidationError,
  giftInputSchema,
} from '@/lib/validation';

const idSchema = z.uuid('That gift is not valid.');

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (!auth.viewer.event) {
    return apiError('There is no active Christmas list to edit yet.', 409);
  }

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('That gift could not be found.', 404);
  }

  const body = await readJsonBody(request);
  const parsed = giftInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  try {
    const result = await updateOwnGiftRecord(
      parsedId.data,
      auth.viewer.member.id,
      auth.viewer.event.id,
      parsed.data,
    );

    if (result === 'not_found') {
      return apiError('That gift could not be found.', 404);
    }

    revalidateViews('/wishlist', '/family');
    return noStoreJson({ ok: true });
  } catch {
    console.error('Could not update gift.');
    return apiError('We could not save that gift just now. Please try again.', 500);
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('That gift could not be found.', 404);
  }

  try {
    const result = await deleteOwnGiftRecord(parsedId.data, auth.viewer.member.id);

    if (result === 'not_found') {
      return apiError('That gift could not be found.', 404);
    }

    if (result === 'not_allowed') {
      return apiError('You can only remove gifts from your own list.', 403);
    }

    revalidateViews('/wishlist', '/family');
    return noStoreJson({ ok: true });
  } catch {
    console.error('Could not delete gift.');
    return apiError('We could not remove that gift just now. Please try again.', 500);
  }
}
