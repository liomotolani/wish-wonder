import 'server-only';
import { createAdminClient } from '@/lib/db/client';
import { listOwnGifts } from '@/lib/db/gifts';
import { listPendingMembers } from '@/lib/db/members';
import type { DashboardData, DashboardMemberView, Viewer } from '@/lib/types';

function toMemberStatus(value: string): 'active' | 'pending' {
  return value === 'pending' ? 'pending' : 'active';
}

/**
 * Data for the family dashboard. Claims are counted only for the current
 * member. No gift-level claim information is loaded, so the recipient's
 * browser cannot receive it.
 */
export async function getDashboardData(viewer: Viewer): Promise<DashboardData> {
  const supabase = createAdminClient();

  const [membersResult, ownGifts, claimsResult] = await Promise.all([
    supabase
      .from('members')
      .select('id, display_name, managed_by_member_id, status')
      .eq('family_id', viewer.family.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true }),
    viewer.event ? listOwnGifts(viewer.member.id, viewer.event.id) : Promise.resolve([]),
    supabase
      .from('claims')
      .select('id, status')
      .eq('claimer_member_id', viewer.member.id)
      .in('status', ['reserved', 'purchased']),
  ]);

  if (membersResult.error) {
    throw membersResult.error;
  }

  if (claimsResult.error) {
    throw claimsResult.error;
  }

  const activeMembers = (membersResult.data ?? []).filter(
    (member) => toMemberStatus(member.status) === 'active',
  );
  const nameById = new Map(activeMembers.map((member) => [member.id, member.display_name]));

  const members: DashboardMemberView[] = activeMembers
    .filter((member) => member.id !== viewer.member.id)
    .map((member) => {
      const managedByName = member.managed_by_member_id
        ? (nameById.get(member.managed_by_member_id) ?? null)
        : null;

      return {
        id: member.id,
        displayName: member.display_name,
        role: member.id === viewer.family.organiserMemberId ? 'organiser' : 'member',
        managedByMemberId: member.managed_by_member_id,
        managedByName,
      };
    });

  const claims = claimsResult.data ?? [];
  const pendingMembers =
    viewer.family.organiserMemberId === viewer.member.id
      ? await listPendingMembers(viewer.family.id)
      : [];

  return {
    members,
    pendingMembers,
    ownGiftCount: ownGifts.length,
    ownGiftNames: ownGifts.slice(0, 3).map((gift) => gift.name),
    reservedCount: claims.filter((claim) => claim.status === 'reserved').length,
    purchasedCount: claims.filter((claim) => claim.status === 'purchased').length,
  };
}
