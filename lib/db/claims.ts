import 'server-only';
import { createAdminClient } from '@/lib/db/client';
import type {
  ClaimedGiftView,
  ClaimStatus,
  NoticeView,
  SecretGiftView,
} from '@/lib/types';
import type { Json } from '@/lib/database.types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function snapshotToGift(snapshot: Json | null): ClaimedGiftView {
  if (!isRecord(snapshot)) {
    return {
      name: 'Gift details unavailable',
      description: null,
      imageUrl: null,
      pricePence: null,
      shopUrl: null,
      preferences: null,
      priority: null,
    };
  }

  return {
    name: stringOrNull(snapshot.name) ?? 'Gift details unavailable',
    description: stringOrNull(snapshot.description),
    imageUrl: stringOrNull(snapshot.image_url),
    pricePence: numberOrNull(snapshot.price_pence),
    shopUrl: stringOrNull(snapshot.shop_url),
    preferences: stringOrNull(snapshot.preferences),
    priority: stringOrNull(snapshot.priority),
  };
}

function toActiveStatus(value: string): Exclude<ClaimStatus, 'released'> {
  return value === 'purchased' ? 'purchased' : 'reserved';
}

/**
 * Only the claimer can read their claims. The organiser and recipient have no
 * query that reaches this function.
 */
export async function listMyClaims(memberId: string): Promise<SecretGiftView[]> {
  const supabase = createAdminClient();
  const { data: claims, error: claimError } = await supabase
    .from('claims')
    .select('id, gift_id, status, gift_snapshot, claimed_at')
    .eq('claimer_member_id', memberId)
    .in('status', ['reserved', 'purchased'])
    .order('claimed_at', { ascending: false });

  if (claimError) {
    throw claimError;
  }

  if (!claims || claims.length === 0) {
    return [];
  }

  const giftIds = claims.map((claim) => claim.gift_id);
  const { data: gifts, error: giftError } = await supabase
    .from('gifts')
    .select('id, owner_member_id')
    .in('id', giftIds);

  if (giftError) {
    throw giftError;
  }

  const ownerByGift = new Map((gifts ?? []).map((gift) => [gift.id, gift.owner_member_id]));
  const ownerIds = Array.from(new Set(Array.from(ownerByGift.values())));

  const { data: owners, error: ownerError } = ownerIds.length
    ? await supabase.from('members').select('id, display_name').in('id', ownerIds)
    : { data: [], error: null };

  if (ownerError) {
    throw ownerError;
  }

  const ownerNames = new Map((owners ?? []).map((owner) => [owner.id, owner.display_name]));

  return claims.map((claim) => {
    const ownerId = ownerByGift.get(claim.gift_id);
    return {
      id: claim.id,
      status: toActiveStatus(claim.status),
      gift: snapshotToGift(claim.gift_snapshot),
      recipientName: ownerId ? (ownerNames.get(ownerId) ?? 'Family member') : 'Family member',
      claimedAt: claim.claimed_at,
    };
  });
}

export async function updateMyClaim(
  claimId: string,
  memberId: string,
  action: 'purchase' | 'release',
): Promise<'ok' | 'not_found'> {
  const supabase = createAdminClient();
  const nextStatus = action === 'purchase' ? 'purchased' : 'released';

  const { data, error } = await supabase
    .from('claims')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', claimId)
    .eq('claimer_member_id', memberId)
    .in('status', ['reserved', 'purchased'])
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? 'ok' : 'not_found';
}

export async function listMyNotices(memberId: string): Promise<NoticeView[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('notices')
    .select('id, message, created_at')
    .eq('member_id', memberId)
    .is('dismissed_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((notice) => ({
    id: notice.id,
    message: notice.message,
    createdAt: notice.created_at,
  }));
}

export async function dismissMyNotice(
  noticeId: string,
  memberId: string,
): Promise<'ok' | 'not_found'> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('notices')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', noticeId)
    .eq('member_id', memberId)
    .is('dismissed_at', null)
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? 'ok' : 'not_found';
}
