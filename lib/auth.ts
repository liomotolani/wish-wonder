import 'server-only';
import type { MemberStatus, Viewer } from '@/lib/types';
import { createAdminClient } from '@/lib/db/client';
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
export async function getViewerByToken(rawToken: string): Promise<Viewer | null> {
  if (!isPersonalTokenFormat(rawToken)) {
    return null;
  }

  const supabase = createAdminClient();
  const { data: session, error: sessionError } = await supabase
    .from('member_sessions')
    .select('id, member_id')
    .eq('token_hash', hashPersonalToken(rawToken))
    .is('revoked_at', null)
    .maybeSingle();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    return null;
  }

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('id, family_id, display_name, status, managed_by_member_id')
    .eq('id', session.member_id)
    .maybeSingle();

  if (memberError) {
    throw memberError;
  }

  if (!member) {
    return null;
  }

  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('id, name, invite_code, organiser_member_id, requires_approval')
    .eq('id', member.family_id)
    .maybeSingle();

  if (familyError) {
    throw familyError;
  }

  if (!family) {
    return null;
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
      inviteCode: family.invite_code,
      organiserMemberId: family.organiser_member_id,
      requiresApproval: family.requires_approval,
    },
    event: event ? { id: event.id, name: event.name } : null,
  };
}

/** Read the session token from a route-handler request without next/headers. */
export function readSessionToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const name = part.slice(0, separator).trim();
    if (name === SESSION_COOKIE_NAME) {
      try {
        return decodeURIComponent(part.slice(separator + 1).trim());
      } catch {
        return null;
      }
    }
  }

  return null;
}

export async function getViewerFromRequest(request: Request): Promise<Viewer | null> {
  const token = readSessionToken(request);
  return token ? getViewerByToken(token) : null;
}
