import { NextResponse } from 'next/server';
import {
  apiError,
  isUniqueViolation,
  noStoreJson,
  readJsonBody,
} from '@/lib/api';
import { createFamilyRecord } from '@/lib/db/families';
import { christmasYear } from '@/lib/dates';
import {
  getAppBaseUrlFromRequest,
  isSecureRequest,
  setSessionCookie,
  setWelcomeCookie,
} from '@/lib/session';
import {
  createInviteCode,
  createPersonalToken,
  hashPersonalToken,
} from '@/lib/tokens';
import { createFamilySchema, formatValidationError } from '@/lib/validation';

export async function POST(request: Request): Promise<NextResponse> {
  const body = await readJsonBody(request);
  const parsed = createFamilySchema.safeParse(body);

  if (!parsed.success) {
    return apiError(formatValidationError(parsed.error), 400);
  }

  const token = createPersonalToken();
  const eventName = `Christmas ${christmasYear()}`;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await createFamilyRecord({
        familyName: parsed.data.familyName,
        memberName: parsed.data.memberName,
        requiresApproval: parsed.data.requiresApproval,
        inviteCode: createInviteCode(),
        tokenHash: hashPersonalToken(token),
        eventName,
      });

      const baseUrl = getAppBaseUrlFromRequest(request);
      const personalLink = `${baseUrl}/me/${token}`;
      const response = noStoreJson(
        {
          personalLink,
          next: '/personal-link?created=1',
          memberName: parsed.data.memberName,
        },
        { status: 201 },
      );
      const secure = isSecureRequest(request);
      setSessionCookie(response, token, secure);
      setWelcomeCookie(response, secure);
      return response;
    } catch (error) {
      if (isUniqueViolation(error)) {
        continue;
      }

      console.error('Could not create family.');
      return apiError('We could not create your family just now. Please try again.', 500);
    }
  }

  return apiError('We could not create your family just now. Please try again.', 500);
}
