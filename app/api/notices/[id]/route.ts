import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  noStoreJson,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import { dismissMyNotice } from '@/lib/db/claims';

const idSchema = z.uuid('That notice is not valid.');

interface RouteContext {
  params: Promise<{ id: string }>;
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
    return apiError('That notice could not be found.', 404);
  }

  try {
    const result = await dismissMyNotice(parsedId.data, auth.viewer.member.id);

    if (result === 'not_found') {
      return apiError('That notice could not be found.', 404);
    }

    revalidateViews('/secret-gifts');
    return noStoreJson({ ok: true });
  } catch {
    console.error('Could not dismiss notice.');
    return apiError('We could not dismiss that notice just now. Please try again.', 500);
  }
}
