import { NextResponse } from 'next/server';
import { apiError, noStoreJson, readJsonBody, requireApiViewer } from '@/lib/api';
import {
  getPickerRecipient,
  getPickerVisitForBuyer,
  getReveal,
} from '@/lib/db/picker';
import {
  formatValidationError,
  revealSchema,
} from '@/lib/validation';

/**
 * Reveal the gift behind one picked number. This is called as soon as a tile
 * is tapped so the reveal screen already has the gift while the box opens.
 * It returns exactly one gift, never the list or any claim data.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (!auth.viewer.event) {
    return apiError('There is no active Christmas list to pick from yet.', 409);
  }

  const body = await readJsonBody(request);
  const parsed = revealSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  try {
    const visit = await getPickerVisitForBuyer(
      parsed.data.visitId,
      auth.viewer.member.id,
    );

    if (!visit) {
      return noStoreJson(
        { ok: false, reason: 'expired', error: 'That picker has expired. Start again from the Home page.' },
        { status: 404 },
      );
    }

    if (visit.recipientMemberId === auth.viewer.member.id) {
      return noStoreJson({ ok: false, reason: 'not_allowed' }, { status: 403 });
    }

    const recipient = await getPickerRecipient(
      visit.recipientMemberId,
      auth.viewer.family.id,
    );

    if (!recipient) {
      return noStoreJson({ ok: false, reason: 'not_found' }, { status: 404 });
    }

    const result = await getReveal(
      visit,
      auth.viewer.event.id,
      parsed.data.number,
    );

    if (result.ok) {
      return noStoreJson({
        ok: true,
        gift: result.gift,
        recipientName: visit.recipientName,
      });
    }

    const status =
      result.reason === 'taken'
        ? 409
        : result.reason === 'rate_limited'
          ? 429
          : result.reason === 'not_allowed'
            ? 403
            : 404;

    return noStoreJson(
      {
        ok: false,
        reason: result.reason,
        recipientName: visit.recipientName,
      },
      { status },
    );
  } catch {
    console.error('Could not reveal a gift.');
    return apiError('We could not open that box just now. Please try again.', 500);
  }
}
