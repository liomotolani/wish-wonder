import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  noStoreJson,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import { removeFamilyMemberRecord } from '@/lib/db/members';

const idSchema = z.uuid('That member is not valid.');

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

  if (auth.viewer.family.organiserMemberId !== auth.viewer.member.id) {
    return apiError('Only the organiser can remove a member.', 403);
  }

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('That member could not be found.', 404);
  }

  try {
    const result = await removeFamilyMemberRecord(
      parsedId.data,
      auth.viewer.family.id,
      auth.viewer.member.id,
    );

    if (result === 'not_allowed') {
      return apiError('The organiser cannot be removed.', 403);
    }

    if (result === 'not_found') {
      return apiError('That member could not be found.', 404);
    }

    revalidateViews('/settings', '/family', '/wishlist', '/secret-gifts');
    return noStoreJson({ ok: true });
  } catch {
    console.error('Could not remove member.');
    return apiError('We could not remove that member just now. Please try again.', 500);
  }
}
