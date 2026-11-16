import 'server-only';
import { createAdminClient } from '@/lib/db/client';
import type { ManagedMemberView } from '@/lib/types';

export interface PendingMember {
  id: string;
  displayName: string;
}

export async function listPendingMembers(familyId: string): Promise<PendingMember[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('id, display_name')
    .eq('family_id', familyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((member) => ({
    id: member.id,
    displayName: member.display_name,
  }));
}

export async function approvePendingMember(
  memberId: string,
  familyId: string,
  organiserMemberId: string,
): Promise<'ok' | 'not_found' | 'not_allowed'> {
  const supabase = createAdminClient();
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('organiser_member_id')
    .eq('id', familyId)
    .maybeSingle();

  if (familyError) {
    throw familyError;
  }

  if (!family || family.organiser_member_id !== organiserMemberId) {
    return 'not_allowed';
  }

  const { data, error } = await supabase
    .from('members')
    .update({ status: 'active' })
    .eq('id', memberId)
    .eq('family_id', familyId)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? 'ok' : 'not_found';
}

export async function listManagedMembers(
  managerMemberId: string,
  familyId: string,
): Promise<ManagedMemberView[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('id, display_name')
    .eq('family_id', familyId)
    .eq('managed_by_member_id', managerMemberId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((member) => ({
    id: member.id,
    displayName: member.display_name,
  }));
}

export async function getManagedMember(
  managedMemberId: string,
  managerMemberId: string,
  familyId: string,
): Promise<ManagedMemberView | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('id, display_name')
    .eq('id', managedMemberId)
    .eq('family_id', familyId)
    .eq('managed_by_member_id', managerMemberId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? { id: data.id, displayName: data.display_name } : null;
}

export async function createManagedMemberRecord(input: {
  familyId: string;
  managerMemberId: string;
  displayName: string;
}): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .insert({
      family_id: input.familyId,
      managed_by_member_id: input.managerMemberId,
      display_name: input.displayName,
      status: 'active',
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function removeFamilyMemberRecord(
  memberId: string,
  familyId: string,
  organiserMemberId: string,
): Promise<'ok' | 'not_found' | 'not_allowed'> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('remove_family_member', {
    p_member_id: memberId,
    p_family_id: familyId,
    p_organiser_member_id: organiserMemberId,
  });

  if (error) {
    throw error;
  }

  if (data === 'ok') {
    return 'ok';
  }

  return data === 'not_allowed' ? 'not_allowed' : 'not_found';
}

export async function reissueMemberLinkRecord(
  memberId: string,
  familyId: string,
  organiserMemberId: string,
  newTokenHash: string,
): Promise<'ok' | 'not_found' | 'not_allowed'> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('reissue_member_link', {
    p_member_id: memberId,
    p_family_id: familyId,
    p_organiser_member_id: organiserMemberId,
    p_new_token_hash: newTokenHash,
  });

  if (error) {
    throw error;
  }

  if (data === 'ok') {
    return 'ok';
  }

  return data === 'not_allowed' ? 'not_allowed' : 'not_found';
}
