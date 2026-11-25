import { NextResponse } from 'next/server';
import { apiError, noStoreJson, requireApiViewer } from '@/lib/api';
import {
  getPickerListView,
  getPickerRecipient,
} from '@/lib/db/picker';

interface RouteContext {
  params: Promise<{ memberId: string }>;
}

/**
 * List view for a recipient. Returns gift details and a Taken flag only.
 * Claimants, claim ids and claim status never leave the server.
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
    return apiError('There is no active Christmas list to pick from yet.', 409);
  }

  const { memberId } = await context.params;
  const recipient = await getPickerRecipient(memberId, auth.viewer.family.id);

  if (!recipient) {
    return apiError('That list is not available.', 404);
  }

  if (recipient.id === auth.viewer.member.id) {
    return apiError('You cannot pick from your own list.', 403);
  }

  const list = await getPickerListView(recipient.id, auth.viewer.event.id);

  return noStoreJson({
    totalCount: list.totalCount,
    availableCount: list.availableCount,
    items: list.items,
  });
}
