import 'server-only';
import { createAdminClient } from '@/lib/db/client';
import { listPendingMembers } from '@/lib/db/members';
import { christmasYear } from '@/lib/dates';
import type { GroupType } from '@/lib/groupWording';
import type { FamilyMemberAdminView, SettingsData, Viewer } from '@/lib/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function getSettingsData(viewer: Viewer): Promise<SettingsData> {
  const supabase = createAdminClient();
  const [membersResult, pendingMembers] = await Promise.all([
    supabase
      .from('members')
      .select('id, display_name, managed_by_member_id, status')
      .eq('family_id', viewer.family.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true }),
    listPendingMembers(viewer.family.id),
  ]);

  if (membersResult.error) {
    throw membersResult.error;
  }

  const rows = membersResult.data ?? [];
  const nameById = new Map(rows.map((member) => [member.id, member.display_name]));

  const members: FamilyMemberAdminView[] = rows.map((member) => ({
    id: member.id,
    displayName: member.display_name,
    status: 'active',
    isOrganiser: member.id === viewer.family.organiserMemberId,
    managedByName: member.managed_by_member_id
      ? (nameById.get(member.managed_by_member_id) ?? null)
      : null,
  }));

  return {
    members,
    pendingMembers,
    activeEvent: viewer.event,
  };
}

export async function updateFamilySettings(input: {
  familyId: string;
  organiserMemberId: string;
  name?: string;
  groupType?: GroupType;
  requiresApproval?: boolean;
  mysteryBoxes?: boolean;
}): Promise<'ok' | 'not_allowed'> {
  const supabase = createAdminClient();
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('organiser_member_id')
    .eq('id', input.familyId)
    .maybeSingle();

  if (familyError) {
    throw familyError;
  }

  if (!family || family.organiser_member_id !== input.organiserMemberId) {
    return 'not_allowed';
  }

  const update: {
    name?: string;
    group_type?: GroupType;
    requires_approval?: boolean;
    mystery_boxes?: boolean;
  } = {};

  if (input.name !== undefined) {
    update.name = input.name;
  }

  if (input.groupType !== undefined) {
    update.group_type = input.groupType;
  }

  if (input.requiresApproval !== undefined) {
    update.requires_approval = input.requiresApproval;
  }

  if (input.mysteryBoxes !== undefined) {
    update.mystery_boxes = input.mysteryBoxes;
  }

  if (Object.keys(update).length === 0) {
    return 'ok';
  }

  const { error } = await supabase
    .from('families')
    .update(update)
    .eq('id', input.familyId);

  if (error) {
    throw error;
  }

  return 'ok';
}

export async function archiveEventRecord(
  eventId: string,
  familyId: string,
  organiserMemberId: string,
): Promise<'ok' | 'not_found' | 'not_allowed'> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('archive_event', {
    p_event_id: eventId,
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

export async function createNextEventRecord(
  familyId: string,
  organiserMemberId: string,
  eventName: string,
): Promise<{ eventId: string; eventName: string }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('create_next_event', {
    p_family_id: familyId,
    p_organiser_member_id: organiserMemberId,
    p_event_name: eventName,
  });

  if (error) {
    throw error;
  }

  if (
    !isRecord(data) ||
    data.ok !== true ||
    typeof data.event_id !== 'string' ||
    typeof data.event_name !== 'string'
  ) {
    throw new Error('The next event could not be created.');
  }

  return { eventId: data.event_id, eventName: data.event_name };
}

/** Pick the next Christmas after every event this family has had. */
export async function getNextEventName(familyId: string): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('events')
    .select('name')
    .eq('family_id', familyId);

  if (error) {
    throw error;
  }

  const years = (data ?? [])
    .map((event) => Number(event.name.match(/(\d{4})/)?.[1]))
    .filter((year) => Number.isFinite(year));

  const latestYear = Math.max(christmasYear(), ...years);
  return `Christmas ${latestYear + 1}`;
}
