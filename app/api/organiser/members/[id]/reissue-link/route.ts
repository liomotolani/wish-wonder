import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  apiError,
  noStoreJson,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import { reissueMemberLinkRecord } from '@/lib/db/members';
import { getAppBaseUrlFromRequest } from '@/lib/session';
import {
  createPersonalToken,
  hashPersonalToken,
} from '@/lib/tokens';

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
    return apiError('Only the organiser can replace a personal link.', 403);
  }

  const { id } = await context.params;
  const parsedId = idSchema.safeParse(id);

  if (!parsedId.success) {
    return apiError('That member could not be found.', 404);
  }

  const token = createPersonalToken();

  try {
    const result = await reissueMemberLinkRecord(
      parsedId.data,
      auth.viewer.family.id,
      auth.viewer.member.id,
      hashPersonalToken(token),
    );

    if (result === 'not_allowed') {
      return apiError('Only the organiser can replace a personal link.', 403);
    }

    if (result === 'not_found') {
      return apiError('That member could not be found.', 404);
    }

    revalidateViews('/settings', '/family');
    return noStoreJson({
      personalLink: `${getAppBaseUrlFromRequest(request)}/me/${token}`,
    });
  } catch {
    console.error('Could not replace personal link.');
    return apiError('We could not replace that link just now. Please try again.', 500);
  }
}
