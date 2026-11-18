import { NextResponse } from 'next/server';
import { apiError, noStoreJson } from '@/lib/api';
import { getViewerFromRequest } from '@/lib/auth';
import { createAdminClient } from '@/lib/db/client';

/** Lightweight poll target for the organiser's pending-approval banner. */
export async function GET(request: Request): Promise<NextResponse> {
  const viewer = await getViewerFromRequest(request, { includeEvent: false });

  if (!viewer) {
    return apiError('Your personal link is needed to do that.', 401);
  }

  if (viewer.member.status !== 'active') {
    return apiError('Your place in the group is still waiting to be approved.', 403);
  }

  if (viewer.family.organiserMemberId !== viewer.member.id) {
    return noStoreJson({ count: 0 });
  }

  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('family_id', viewer.family.id)
    .eq('status', 'pending');

  if (error) {
    return noStoreJson({ count: 0 });
  }

  return noStoreJson({ count: count ?? 0 });
}
