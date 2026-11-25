import 'server-only';
import type { MemberStatus, Viewer } from '@/lib/types';
import { createAdminClient } from '@/lib/db/client';
import {
  activeSessionToken,
  parseDeviceSessions,
  readCookieValue,
  DEVICE_SESSIONS_COOKIE_NAME,
} from '@/lib/device-sessions';
import { isGroupType } from '@/lib/groupWording';
import {
  SESSION_COOKIE_NAME,
  hashPersonalToken,
  isPersonalTokenFormat,
} from '@/lib/tokens';

function toMemberStatus(value: string): MemberStatus {
  return value === 'pending' ? 'pending' : 'active';
}

/**
 * Resolve a raw personal-link token to a member. Only the SHA-256 hash is
 * looked up, and revoked sessions are ignored.
 */
export async function getViewerByToken(
  rawToken: string,
  options: { includeEvent?: boolean } = {},
): Promise<Viewer | null> {
  if (!isPersonalTokenFormat(rawToken)) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: session, error: sessionError } = await supabase
    .from('member_sessions')
    .select(
      'id, member_id, members!member_sessions_member_id_fkey!inner(id, family_id, display_name, status, managed_by_member_id, families!members_family_id_fkey!inner(id, name, group_type, invite_code, mystery_boxes, organiser_member_id, requires_approval))',
    )
    .eq('token_hash', hashPersonalToken(rawToken))
    .is('revoked_at', null)
    .maybeSingle();

  if (sessionError) {
    throw sessionError;
  }

  const member = session?.members ?? null;
  const family = member?.families ?? null;

  if (!session || !member || !family) {
    return null;
  }

  if (options.includeEvent === false) {
    return {
      sessionId: session.id,
      member: {
        id: member.id,
        displayName: member.display_name,
        status: toMemberStatus(member.status),
        managedByMemberId: member.managed_by_member_id,
      },
      family: {
        id: family.id,
        name: family.name,
        groupType: isGroupType(family.group_type) ? family.group_type : 'family',
        inviteCode: family.invite_code,
        mysteryBoxes: family.mystery_boxes,
        organiserMemberId: family.organiser_member_id,
        requiresApproval: family.requires_approval,
      },
      event: null,
    };
  }

  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('id, name')
    .eq('family_id', family.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (eventError) {
    throw eventError;
  }

  return {
    sessionId: session.id,
    member: {
      id: member.id,
      displayName: member.display_name,
      status: toMemberStatus(member.status),
      managedByMemberId: member.managed_by_member_id,
    },
    family: {
      id: family.id,
      name: family.name,
      groupType: isGroupType(family.group_type) ? family.group_type : 'family',
      inviteCode: family.invite_code,
      mysteryBoxes: family.mystery_boxes,
      organiserMemberId: family.organiser_member_id,
      requiresApproval: family.requires_approval,
    },
    event: event ? { id: event.id, name: event.name } : null,
  };
}

/** Read the active group's session token from a route-handler request. */
export function readSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  const device = parseDeviceSessions(
    readCookieValue(cookieHeader, DEVICE_SESSIONS_COOKIE_NAME),
  );
  const active = activeSessionToken(device);

  if (active) {
    return active;
  }

  return readCookieValue(cookieHeader, SESSION_COOKIE_NAME);
}

export async function getViewerFromRequest(
  request: Request,
  options: { includeEvent?: boolean } = {},
): Promise<Viewer | null> {
  const token = readSessionToken(request);
  return token ? getViewerByToken(token, options) : null;
}
