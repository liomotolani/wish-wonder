import { NextResponse } from 'next/server';
import {
  apiError,
  noStoreJson,
  readJsonBody,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import { updateFamilySettings } from '@/lib/db/organiser';
import {
  familySettingsSchema,
  formatValidationError,
} from '@/lib/validation';

export async function PATCH(request: Request): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (auth.viewer.family.organiserMemberId !== auth.viewer.member.id) {
    return apiError('Only the organiser can change group settings.', 403);
  }

  const body = await readJsonBody(request);
  const parsed = familySettingsSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  try {
    const result = await updateFamilySettings({
      familyId: auth.viewer.family.id,
      organiserMemberId: auth.viewer.member.id,
      name: parsed.data.name,
      groupType: parsed.data.groupType,
      requiresApproval: parsed.data.requiresApproval,
      mysteryBoxes: parsed.data.mysteryBoxes,
    });

    if (result === 'not_allowed') {
      return apiError('Only the organiser can change group settings.', 403);
    }

    revalidateViews(
      '/settings',
      '/family',
      `/join/${auth.viewer.family.inviteCode}`,
    );
    return noStoreJson({ ok: true });
  } catch {
    console.error('Could not update family settings.');
    return apiError('We could not save those settings just now. Please try again.', 500);
  }
}
