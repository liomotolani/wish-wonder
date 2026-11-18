import { NextResponse } from 'next/server';
import { apiError, noStoreJson, requireApiViewer } from '@/lib/api';
import { createAdminClient } from '@/lib/db/client';
import { getPickerRecipient } from '@/lib/db/picker';

interface RouteContext {
  params: Promise<{ memberId: string }>;
}

/**
 * A tiny change signal for an open picker. It returns only counts, never gifts
 * or claims, so the buyer's page can refresh when the list grows or a box is
 * taken by someone else.
 */
export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (!auth.viewer.event) {
    return noStoreJson({ total: 0, available: 0 });
  }

  const { memberId } = await context.params;
  const recipient = await getPickerRecipient(memberId, auth.viewer.family.id);

  if (!recipient) {
    return apiError('That list is not available.', 404);
  }

  const supabase = createAdminClient();
  const { data: gifts, error: giftError } = await supabase
    .from('gifts')
    .select('id')
    .eq('owner_member_id', recipient.id)
    .eq('event_id', auth.viewer.event.id);

  if (giftError) {
    return noStoreJson({ total: 0, available: 0 });
  }

  const giftIds = (gifts ?? []).map((gift) => gift.id);

  if (giftIds.length === 0) {
    return noStoreJson({ total: 0, available: 0 });
  }

  const { data: claims, error: claimError } = await supabase
    .from('claims')
    .select('gift_id')
    .in('gift_id', giftIds)
    .in('status', ['reserved', 'purchased']);

  if (claimError) {
    return noStoreJson({ total: giftIds.length, available: giftIds.length });
  }

  const taken = new Set((claims ?? []).map((claim) => claim.gift_id));

  return noStoreJson({
    total: giftIds.length,
    available: giftIds.length - taken.size,
  });
}
