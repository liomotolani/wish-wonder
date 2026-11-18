import { NextResponse } from 'next/server';
import {
  apiError,
  isUniqueViolation,
  noStoreJson,
  readJsonBody,
} from '@/lib/api';
import { createFamilyRecord } from '@/lib/db/families';
import { readDeviceSessionsFromRequest } from '@/lib/device-sessions.server';
import { christmasYear } from '@/lib/dates';
import {
  addGroupSessionCookie,
  getAppBaseUrlFromRequest,
  isSecureRequest,
  setWelcomeCookie,
} from '@/lib/session';
import {
  createInviteCode,
  createPersonalToken,
  hashPersonalToken,
} from '@/lib/tokens';
import { createFamilySchema, formatValidationError } from '@/lib/validation';
import { allowApiRequest } from '@/lib/rate-limit';

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await allowApiRequest(request, 'create_group', 20, 60 * 60))) {
    return apiError('That is a lot of tries. Please wait a little while and try again.', 429);
  }

  const body = await readJsonBody(request);
  const parsed = createFamilySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  const token = createPersonalToken();
  const eventName = `Christmas ${christmasYear()}`;
  const existingDevice = readDeviceSessionsFromRequest(request);
  const alreadyHasGroups = Boolean(
    existingDevice && Object.keys(existingDevice.sessions).length > 0,
  );

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const inviteCode = createInviteCode();
      const created = await createFamilyRecord({
        familyName: parsed.data.familyName,
        groupType: parsed.data.groupType,
        memberName: parsed.data.memberName,
        requiresApproval: parsed.data.requiresApproval,
        inviteCode,
        tokenHash: hashPersonalToken(token),
        eventName,
      });

      const baseUrl = getAppBaseUrlFromRequest(request);
      const personalLink = `${baseUrl}/me/${token}`;
      const inviteLink = `${baseUrl}/join/${inviteCode}`;
      const response = noStoreJson(
        {
          personalLink,
          inviteLink,
          next: alreadyHasGroups ? '/family' : '/group-link?created=1',
          memberName: parsed.data.memberName,
        },
        { status: 201 },
      );
      const secure = isSecureRequest(request);
      addGroupSessionCookie(response, request, created.familyId, token, secure);
      setWelcomeCookie(response, secure);
      return response;
    } catch (error) {
      if (isUniqueViolation(error)) {
        continue;
      }

      console.error('Could not create family.');
      return apiError('We could not start your group just now. Please try again.', 500);
    }
  }

  return apiError('We could not start your group just now. Please try again.', 500);
}
