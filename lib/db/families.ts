import 'server-only';
import { createAdminClient } from '@/lib/db/client';
import type { FamilyInvitePreview, MemberStatus } from '@/lib/types';

export interface CreateFamilyRecordInput {
  familyName: string;
  memberName: string;
  requiresApproval: boolean;
  inviteCode: string;
  tokenHash: string;
  eventName: string;
}

export interface CreateFamilyRecord {
  familyId: string;
  memberId: string;
  eventId: string;
}

export type JoinFamilyRecord =
  | { ok: true; memberId: string; memberStatus: MemberStatus; familyName: string }
  | { ok: false; reason: 'not_found' | 'name_taken' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function createFamilyRecord(
  input: CreateFamilyRecordInput,
): Promise<CreateFamilyRecord> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('create_family', {
    p_family_name: input.familyName,
    p_member_name: input.memberName,
    p_requires_approval: input.requiresApproval,
    p_invite_code: input.inviteCode,
    p_token_hash: input.tokenHash,
    p_event_name: input.eventName,
  });

  if (error) {
    throw error;
  }

  if (
    !isRecord(data) ||
    typeof data.family_id !== 'string' ||
    typeof data.member_id !== 'string' ||
    typeof data.event_id !== 'string'
  ) {
    throw new Error('The family could not be created.');
  }

  return {
    familyId: data.family_id,
    memberId: data.member_id,
    eventId: data.event_id,
  };
}

export async function joinFamilyRecord(
  inviteCode: string,
  memberName: string,
  tokenHash: string,
): Promise<JoinFamilyRecord> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('join_family', {
    p_invite_code: inviteCode,
    p_member_name: memberName,
    p_token_hash: tokenHash,
  });

  if (error) {
    throw error;
  }

  if (!isRecord(data)) {
    throw new Error('The family could not be joined.');
  }

  if (data.ok !== true) {
    return { ok: false, reason: data.reason === 'name_taken' ? 'name_taken' : 'not_found' };
  }

  if (typeof data.member_id !== 'string' || typeof data.family_name !== 'string') {
    throw new Error('The family could not be joined.');
  }

  return {
    ok: true,
    memberId: data.member_id,
    memberStatus: data.member_status === 'pending' ? 'pending' : 'active',
    familyName: data.family_name,
  };
}

export async function getFamilyInvitePreview(
  inviteCode: string,
): Promise<FamilyInvitePreview | null> {
  const supabase = createAdminClient();
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('id, name, requires_approval')
    .eq('invite_code', inviteCode)
    .maybeSingle();

  if (familyError) {
    throw familyError;
  }

  if (!family) {
    return null;
  }

  const { data: members, error: memberError } = await supabase
    .from('members')
    .select('display_name')
    .eq('family_id', family.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (memberError) {
    throw memberError;
  }

  const memberNames = (members ?? []).map((member) => member.display_name);

  return {
    familyName: family.name,
    requiresApproval: family.requires_approval,
    memberNames: memberNames.slice(0, 4),
    memberCount: memberNames.length,
  };
}
