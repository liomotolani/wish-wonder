import { NextResponse } from 'next/server';
import { apiError, noStoreJson, readJsonBody } from '@/lib/api';
import { joinFamilyRecord } from '@/lib/db/families';
import {
  addGroupSessionCookie,
  getAppBaseUrlFromRequest,
  isSecureRequest,
  setWelcomeCookie,
} from '@/lib/session';
import {
  createPersonalToken,
  hashPersonalToken,
} from '@/lib/tokens';
import {
  formatValidationError,
  inviteCodeSchema,
  joinFamilySchema,
} from '@/lib/validation';
import { allowApiRequest } from '@/lib/rate-limit';

export async function POST(
  request: Request,
  context: { params: Promise<{ code: string }> },
): Promise<NextResponse> {
  if (!(await allowApiRequest(request, 'join_group', 60, 10 * 60))) {
    return apiError('That is a lot of tries. Please wait a little while and try again.', 429);
  }

  const { code } = await context.params;
  const parsedCode = inviteCodeSchema.safeParse(code);

  if (!parsedCode.success) {
    return apiError('That invite link is not valid. Ask your organiser for a new one.', 404);
  }

  const body = await readJsonBody(request);
  const parsedBody = joinFamilySchema.safeParse(body);

  if (!parsedBody.success) {
    return apiError(formatValidationError(parsedBody.error), 400);
  }

  const token = createPersonalToken();

  try {
    const result = await joinFamilyRecord(
      parsedCode.data,
      parsedBody.data.memberName,
      hashPersonalToken(token),
    );

    if (!result.ok) {
      if (result.reason === 'name_taken') {
        return apiError(
          'Someone in this group already uses that name. Try another one.',
          409,
        );
      }

      return apiError(
        'That invite link is not valid. Ask your organiser for a new one.',
        404,
      );
    }

    const baseUrl = getAppBaseUrlFromRequest(request);
    const response = noStoreJson(
      {
        personalLink: `${baseUrl}/me/${token}`,
        next: `/personal-link?status=${result.memberStatus}`,
        memberStatus: result.memberStatus,
        familyName: result.familyName,
      },
      { status: 201 },
    );
    const secure = isSecureRequest(request);
    addGroupSessionCookie(response, request, result.familyId, token, secure);
    setWelcomeCookie(response, secure);
    return response;
  } catch {
    console.error('Could not join family.');
    return apiError('We could not join you just now. Please try again.', 500);
  }
}
