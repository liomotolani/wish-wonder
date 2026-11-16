import 'server-only';
import { createAdminClient } from '@/lib/db/client';
import { PRIORITY_REALLY_WANT, type giftInputSchema } from '@/lib/validation';
import type { OwnGiftView } from '@/lib/types';
import type { z } from 'zod';

export type GiftInput = z.infer<typeof giftInputSchema>;

const OWN_GIFT_COLUMNS =
  'id, name, description, image_url, price_pence, shop_url, preferences, priority, updated_at';

interface OwnGiftRow {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price_pence: number | null;
  shop_url: string | null;
  preferences: string | null;
  priority: string | null;
  updated_at: string;
}

function toOwnGift(row: OwnGiftRow): OwnGiftView {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    pricePence: row.price_pence,
    shopUrl: row.shop_url,
    preferences: row.preferences,
    priority: row.priority,
    updatedAt: row.updated_at,
  };
}

/**
 * A member's own wish list. This selects no claim columns and joins no claims
 * table, so claim data can never reach the owner's browser.
 */
export async function listOwnGifts(
  ownerMemberId: string,
  eventId: string,
): Promise<OwnGiftView[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('gifts')
    .select(OWN_GIFT_COLUMNS)
    .eq('owner_member_id', ownerMemberId)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toOwnGift(row as OwnGiftRow));
}

export async function getOwnGift(
  giftId: string,
  ownerMemberId: string,
  eventId: string,
): Promise<OwnGiftView | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('gifts')
    .select(OWN_GIFT_COLUMNS)
    .eq('id', giftId)
    .eq('owner_member_id', ownerMemberId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toOwnGift(data as OwnGiftRow) : null;
}

function giftWriteValues(input: GiftInput) {
  return {
    name: input.name,
    description: input.description,
    image_url: input.imageUrl,
    price_pence: input.pricePence,
    shop_url: input.shopUrl,
    preferences: input.preferences,
    priority: input.priority ? PRIORITY_REALLY_WANT : null,
  };
}

export async function createGiftRecord(
  eventId: string,
  ownerMemberId: string,
  input: GiftInput,
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('gifts')
    .insert({
      event_id: eventId,
      owner_member_id: ownerMemberId,
      ...giftWriteValues(input),
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data.id;
}

export async function updateOwnGiftRecord(
  giftId: string,
  ownerMemberId: string,
  eventId: string,
  input: GiftInput,
): Promise<'ok' | 'not_found'> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('gifts')
    .update({
      ...giftWriteValues(input),
      updated_at: new Date().toISOString(),
    })
    .eq('id', giftId)
    .eq('owner_member_id', ownerMemberId)
    .eq('event_id', eventId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? 'ok' : 'not_found';
}

export async function deleteOwnGiftRecord(
  giftId: string,
  ownerMemberId: string,
): Promise<'ok' | 'not_found' | 'not_allowed'> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('delete_own_gift', {
    p_gift_id: giftId,
    p_owner_member_id: ownerMemberId,
  });

  if (error) {
    throw error;
  }

  if (data === 'ok') {
    return 'ok';
  }

  return data === 'not_allowed' ? 'not_allowed' : 'not_found';
}
