import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  noStoreJson,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import { approvePendingMember } from '@/lib/db/members';

const idSchema = z.uuid('That member is not valid.');

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

  if (auth.viewer.family.organiserMemberId !== auth.viewer.member.id) {
    return apiError('Only the organiser can let new members in.', 403);
  }

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('That member could not be found.', 404);
  }

  try {
    const result = await approvePendingMember(
      parsedId.data,
      auth.viewer.family.id,
      auth.viewer.member.id,
    );

    if (result === 'not_allowed') {
      return apiError('Only the organiser can let new members in.', 403);
    }

    if (result === 'not_found') {
      return apiError('That member could not be found.', 404);
    }

    revalidateViews('/family');
    return noStoreJson({ ok: true });
  } catch {
    console.error('Could not approve member.');
    return apiError('We could not let them in just now. Please try again.', 500);
  }
}
