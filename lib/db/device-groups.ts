import 'server-only';
import { cache } from 'react';
import { createAdminClient } from '@/lib/db/client';
import { isGroupType } from '@/lib/groupWording';
import { readDeviceSessions } from '@/lib/device-sessions.server';
import { hashPersonalToken } from '@/lib/tokens';
import type { DeviceGroupView } from '@/lib/types';

interface DeviceGroupRow {
  token_hash: string;
  members: {
    display_name: string;
    family_id: string;
    families: {
      id: string;
      name: string;
      group_type: string;
    } | null;
  } | null;
}

/**
 * The groups this device remembers, with the member's name in each. Used only
 * for the switcher, so one batched query covers every group on the device.
 */
export const listDeviceGroups = cache(async (): Promise<DeviceGroupView[]> => {
  const device = await readDeviceSessions();

  if (!device) {
    return [];
  }

  const entries = Object.entries(device.sessions);

  if (entries.length === 0) {
    return [];
  }

  const hashes = entries.map(([, token]) => hashPersonalToken(token));
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('member_sessions')
    .select(
      'token_hash, members!member_sessions_member_id_fkey!inner(display_name, family_id, families!members_family_id_fkey!inner(id, name, group_type))',
    )
    .in('token_hash', hashes)
    .is('revoked_at', null);

  if (error) {
    throw error;
  }

  const rowsByHash = new Map(
    ((data ?? []) as unknown as DeviceGroupRow[]).map((row) => [row.token_hash, row]),
  );
  const groups: DeviceGroupView[] = [];

  for (const [familyId, token] of entries) {
    const row = rowsByHash.get(hashPersonalToken(token));
    const family = row?.members?.families;

    if (!row?.members || !family || family.id !== familyId) {
      continue;
    }

    groups.push({
      familyId,
      name: family.name,
      groupType: isGroupType(family.group_type) ? family.group_type : 'family',
      memberName: row.members.display_name,
      isActive: familyId === device.active,
    });
  }

  return groups;
});
