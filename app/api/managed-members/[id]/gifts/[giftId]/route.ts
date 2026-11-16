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
import { getManagedMember } from '@/lib/db/members';
import {
  formatValidationError,
  giftInputSchema,
} from '@/lib/validation';

const idSchema = z.uuid('That list is not valid.');
const giftIdSchema = z.uuid('That gift is not valid.');

interface RouteContext {
  params: Promise<{ id: string; giftId: string }>;
}

async function resolveManaged(
  request: Request,
  context: RouteContext,
  requireEvent: boolean,
) {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return { ok: false as const, response: auth.response };
  }

  if (requireEvent && !auth.viewer.event) {
    return {
      ok: false as const,
      response: apiError('There is no active Christmas list to edit yet.', 409),
    };
  }

  const { id, giftId } = await context.params;
  const parsedId = idSchema.safeParse(id);
  const parsedGiftId = giftIdSchema.safeParse(giftId);

  if (!parsedId.success || !parsedGiftId.success) {
    return {
      ok: false as const,
      response: apiError('That gift could not be found.', 404),
    };
  }

  const managed = await getManagedMember(
    parsedId.data,
    auth.viewer.member.id,
    auth.viewer.family.id,
  );

  if (!managed) {
    return {
      ok: false as const,
      response: apiError('That list could not be found.', 404),
    };
  }

  return { ok: true as const, auth, managed, giftId: parsedGiftId.data };
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const resolved = await resolveManaged(request, context, true);

  if (!resolved.ok) {
    return resolved.response;
  }

  if (!resolved.auth.viewer.event) {
    return apiError('There is no active Christmas list to edit yet.', 409);
  }

  const body = await readJsonBody(request);
  const parsed = giftInputSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  try {
    const result = await updateOwnGiftRecord(
      resolved.giftId,
      resolved.managed.id,
      resolved.auth.viewer.event.id,
      parsed.data,
    );

    if (result === 'not_found') {
      return apiError('That gift could not be found.', 404);
    }

    revalidateViews(
      '/wishlist',
      `/wishlist/managed/${resolved.managed.id}`,
      '/family',
    );
    return noStoreJson({ ok: true });
  } catch {
    console.error('Could not update managed gift.');
    return apiError('We could not save that gift just now. Please try again.', 500);
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const resolved = await resolveManaged(request, context, false);

  if (!resolved.ok) {
    return resolved.response;
  }

  try {
    const result = await deleteOwnGiftRecord(
      resolved.giftId,
      resolved.managed.id,
    );

    if (result === 'not_found') {
      return apiError('That gift could not be found.', 404);
    }

    revalidateViews(
      '/wishlist',
      `/wishlist/managed/${resolved.managed.id}`,
      '/family',
    );
    return noStoreJson({ ok: true });
  } catch {
    console.error('Could not delete managed gift.');
    return apiError('We could not remove that gift just now. Please try again.', 500);
  }
}
