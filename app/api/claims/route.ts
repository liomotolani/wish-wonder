import { NextResponse } from 'next/server';
import {
  apiError,
  noStoreJson,
  readJsonBody,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import {
  claimFromGiftId,
  claimFromVisit,
  getPickerVisitForBuyer,
} from '@/lib/db/picker';
import type { ClaimResult } from '@/lib/types';
import {
  claimSchema,
  formatValidationError,
} from '@/lib/validation';

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (!auth.viewer.event) {
    return apiError('There is no active Christmas list to pick from yet.', 409);
  }

  const body = await readJsonBody(request);
  const parsed = claimSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  try {
    let result: ClaimResult;

    if ('giftId' in parsed.data) {
      result = await claimFromGiftId(
        auth.viewer,
        parsed.data.giftId,
        auth.viewer.event.id,
      );
    } else {
      if (!auth.viewer.family.mysteryBoxes) {
        return apiError('Mystery boxes are turned off for this group.', 403);
      }

      const visit = await getPickerVisitForBuyer(
        parsed.data.visitId,
        auth.viewer.member.id,
      );

      if (!visit) {
        return apiError('That picker has expired. Start again from the Home page.', 404);
      }

      if (visit.recipientMemberId === auth.viewer.member.id) {
        return apiError('You cannot pick from your own list.', 403);
      }

      result = await claimFromVisit(
        auth.viewer,
        visit,
        auth.viewer.event.id,
        parsed.data.number,
      );
    }

    if (result.ok) {
      revalidateViews('/secret-gifts', '/family');
      return noStoreJson({ ok: true });
    }

    if (result.reason === 'already_picked') {
      return noStoreJson({ ok: false, reason: result.reason }, { status: 409 });
    }

    if (result.reason === 'not_revealed') {
      return noStoreJson({ ok: false, reason: result.reason }, { status: 400 });
    }

    if (result.reason === 'not_allowed') {
      return noStoreJson({ ok: false, reason: result.reason }, { status: 403 });
    }

    return noStoreJson({ ok: false, reason: result.reason }, { status: 404 });
  } catch {
    console.error('Could not claim gift.');
    return apiError('We could not reserve that gift just now. Please try again.', 500);
  }
}
