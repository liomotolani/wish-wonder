import { NextResponse } from 'next/server';
import {
  apiError,
  isUniqueViolation,
  noStoreJson,
  readJsonBody,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import { createManagedMemberRecord } from '@/lib/db/members';
import {
  formatValidationError,
  managedMemberSchema,
} from '@/lib/validation';

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  const body = await readJsonBody(request);
  const parsed = managedMemberSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  try {
    const managedMemberId = await createManagedMemberRecord({
      familyId: auth.viewer.family.id,
      managerMemberId: auth.viewer.member.id,
      displayName: parsed.data.displayName,
    });

    revalidateViews('/family', '/wishlist');
    return noStoreJson({ ok: true, managedMemberId }, { status: 201 });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return apiError(
        'Someone in the family already uses that name. Try another one.',
        409,
      );
    }

    console.error('Could not add managed member.');
    return apiError('We could not add them just now. Please try again.', 500);
  }
}
