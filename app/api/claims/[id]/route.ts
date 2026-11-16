import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  noStoreJson,
  readJsonBody,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import { updateMyClaim } from '@/lib/db/claims';
import {
  claimUpdateSchema,
  formatValidationError,
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

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('That secret gift could not be found.', 404);
  }

  const body = await readJsonBody(request);
  const parsed = claimUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  try {
    const result = await updateMyClaim(
      parsedId.data,
      auth.viewer.member.id,
      parsed.data.action,
    );

    if (result === 'not_found') {
      return apiError('That secret gift could not be found.', 404);
    }

    revalidateViews('/secret-gifts', '/family');
    return noStoreJson({ ok: true });
  } catch {
    console.error('Could not update claim.');
    return apiError('We could not update that gift just now. Please try again.', 500);
  }
}
