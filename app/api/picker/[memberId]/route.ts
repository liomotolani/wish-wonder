import { NextResponse } from 'next/server';
import { apiError, noStoreJson, requireApiViewer } from '@/lib/api';
import {
  getOrCreatePickerVisit,
  getPickerGridView,
  getPickerRecipient,
} from '@/lib/db/picker';

interface RouteContext {
  params: Promise<{ memberId: string }>;
}

interface BoxDto {
  number: number;
  state?: 'mystery' | 'peeked';
  pricePence?: number | null;
  currency?: string;
  taken?: true;
}

/**
 * Mystery boxes for one recipient. Taken boxes carry only their number and
 * taken flag; the number-to-gift mapping never leaves the server.
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

  if (!auth.viewer.family.mysteryBoxes) {
    return apiError('Mystery boxes are turned off for this group.', 403);
  }

  const { memberId } = await context.params;
  const recipient = await getPickerRecipient(memberId, auth.viewer.family.id);

  if (!recipient) {
    return apiError('That list is not available.', 404);
  }

  if (recipient.id === auth.viewer.member.id) {
    return apiError('You cannot pick from your own list.', 403);
  }

  const visitId = new URL(request.url).searchParams.get('visit') ?? undefined;
  const visit = await getOrCreatePickerVisit({
    buyerMemberId: auth.viewer.member.id,
    recipient,
    familyId: auth.viewer.family.id,
    visitId,
  });

  if (!visit) {
    return apiError('That picker is not available.', 404);
  }

  const grid = await getPickerGridView(visit, auth.viewer.event.id);
  const boxes: BoxDto[] = grid.boxes.map((box) =>
    box.state === 'taken'
      ? { number: box.number, taken: true }
      : {
          number: box.number,
          state: box.state,
          pricePence: box.pricePence,
          currency: box.currency,
        },
  );

  return noStoreJson({
    visitId: visit.id,
    totalCount: grid.totalCount,
    availableCount: grid.availableCount,
    boxes,
  });
}
