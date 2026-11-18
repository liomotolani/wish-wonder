import 'server-only';
import { createAdminClient } from '@/lib/db/client';
import type { MemberStatus } from '@/lib/types';

interface DeviceLinkResult {
  ok: boolean;
  reason?: string;
  member_id?: string;
  family_id?: string;
  member_status?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function createDeviceLinkRecord(input: {
  memberId: string;
  tokenHash: string;
  expiresAt: string;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('device_links').insert({
    member_id: input.memberId,
    token_hash: input.tokenHash,
    expires_at: input.expiresAt,
  });

  if (error) {
    throw error;
  }
}

export type UseDeviceLinkResult =
  | { ok: true; memberId: string; familyId: string; memberStatus: MemberStatus }
  | { ok: false; reason: 'not_found' | 'used' | 'expired' };

export async function redeemDeviceLinkRecord(
  tokenHash: string,
  newSessionTokenHash: string,
): Promise<UseDeviceLinkResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('use_device_link', {
    p_token_hash: tokenHash,
    p_new_session_token_hash: newSessionTokenHash,
  });

  if (error) {
    throw error;
  }

  if (!isRecord(data) || data.ok !== true) {
    const reason = isRecord(data) && typeof data.reason === 'string' ? data.reason : '';
    return {
      ok: false,
      reason:
        reason === 'used' || reason === 'expired' ? reason : 'not_found',
    };
  }

  const result = data as unknown as DeviceLinkResult;

  if (typeof result.member_id !== 'string') {
    throw new Error('The device link did not return a member.');
  }

  if (typeof result.family_id !== 'string') {
    throw new Error('The device link did not return a group.');
  }

  return {
    ok: true,
    memberId: result.member_id,
    familyId: result.family_id,
    memberStatus: result.member_status === 'pending' ? 'pending' : 'active',
  };
}
