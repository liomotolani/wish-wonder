import 'server-only';
import { createAdminClient } from '@/lib/db/client';
import { DEFAULT_CURRENCY, isCurrencyCode } from '@/lib/currencies';
import { shuffleGiftIds } from '@/lib/picker-shuffle';
import { createPickerSeed } from '@/lib/tokens';
import { PRIORITY_REALLY_WANT } from '@/lib/validation';
import type { CurrencyCode } from '@/lib/currencies';
import type {
  ClaimResult,
  MysteryBoxView,
  PickerGridView,
  PickerListItemView,
  PickerListView,
  RevealResult,
  RevealedGiftView,
  Viewer,
} from '@/lib/types';
import { shopNameFromUrl } from '@/lib/shop';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const REVEAL_LIMIT = 30;
export const REVEAL_WINDOW_SECONDS = 60;

export interface PickerRecipient {
  id: string;
  displayName: string;
}

export interface PickerVisitView {
  id: string;
  buyerMemberId: string;
  recipientMemberId: string;
  recipientName: string;
  seed: number;
  peekedGiftIds: string[];
}

interface GiftRow {  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  currency: string;
  price_pence: number | null;
  shop_url: string | null;
  preferences: string | null;
  priority: string | null;
}

function toRevealedGift(row: GiftRow): RevealedGiftView {
  return {
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    currency: isCurrencyCode(row.currency) ? row.currency : DEFAULT_CURRENCY,
    pricePence: row.price_pence,
    shopUrl: row.shop_url,
    preferences: row.preferences,
    priority: row.priority,
  };
}

export async function getPickerRecipient(
  memberId: string,
  familyId: string,
): Promise<PickerRecipient | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('id, display_name')
    .eq('id', memberId)
    .eq('family_id', familyId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? { id: data.id, displayName: data.display_name } : null;
}

/** Reuse a visit when returning from a reveal, otherwise shuffle afresh. */
export async function getOrCreatePickerVisit(input: {
  buyerMemberId: string;
  recipient: PickerRecipient;
  familyId: string;
  visitId?: string;
}): Promise<PickerVisitView | null> {
  const recipient = await getPickerRecipient(input.recipient.id, input.familyId);

  if (!recipient) {
    return null;
  }

  const supabase = createAdminClient();

  if (input.visitId && UUID_PATTERN.test(input.visitId)) {
    const { data: existing, error: existingError } = await supabase
      .from('picker_visits')
      .select('id, buyer_member_id, recipient_member_id, seed, peeked_gift_ids')
      .eq('id', input.visitId)
      .eq('buyer_member_id', input.buyerMemberId)
      .eq('recipient_member_id', recipient.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return {
        id: existing.id,
        buyerMemberId: existing.buyer_member_id,
        recipientMemberId: existing.recipient_member_id,
        recipientName: recipient.displayName,
        seed: existing.seed,
        peekedGiftIds: existing.peeked_gift_ids,
      };
    }
  }

  const { data: created, error: createError } = await supabase
    .from('picker_visits')
    .insert({
      buyer_member_id: input.buyerMemberId,
      recipient_member_id: recipient.id,
      seed: createPickerSeed(),
    })
    .select('id, buyer_member_id, recipient_member_id, seed, peeked_gift_ids')
    .single();

  if (createError) {
    throw createError;
  }

  return {
    id: created.id,
    buyerMemberId: created.buyer_member_id,
    recipientMemberId: created.recipient_member_id,
    recipientName: recipient.displayName,
    seed: created.seed,
    peekedGiftIds: created.peeked_gift_ids,
  };
}

export async function getPickerVisitById(
  visitId: string,
  buyerMemberId: string,
  recipientId: string,
): Promise<Omit<PickerVisitView, 'recipientName'> | null> {
  const visit = await getPickerVisitForBuyer(visitId, buyerMemberId);

  if (!visit || visit.recipientMemberId !== recipientId) {
    return null;
  }

  return {
    id: visit.id,
    buyerMemberId: visit.buyerMemberId,
    recipientMemberId: visit.recipientMemberId,
    seed: visit.seed,
    peekedGiftIds: visit.peekedGiftIds,
  };
}

/** Load a visit and its recipient, scoped to the buyer. */
export async function getPickerVisitForBuyer(
  visitId: string,
  buyerMemberId: string,
): Promise<PickerVisitView | null> {
  if (!UUID_PATTERN.test(visitId)) {
    return null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('picker_visits')
    .select('id, buyer_member_id, recipient_member_id, seed, peeked_gift_ids')
    .eq('id', visitId)
    .eq('buyer_member_id', buyerMemberId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { data: recipient, error: recipientError } = await supabase
    .from('members')
    .select('display_name')
    .eq('id', data.recipient_member_id)
    .maybeSingle();

  if (recipientError) {
    throw recipientError;
  }

  return {
    id: data.id,
    buyerMemberId: data.buyer_member_id,
    recipientMemberId: data.recipient_member_id,
    recipientName: recipient?.display_name ?? 'your family member',
    seed: data.seed,
    peekedGiftIds: data.peeked_gift_ids,
  };
}

interface OrderedPickerGifts {
  orderedGiftIds: string[];
  activeClaimGiftIds: Set<string>;
  priceByGiftId: Map<string, { pricePence: number | null; currency: CurrencyCode }>;
}

async function getOrderedPickerGifts(
  recipientMemberId: string,
  eventId: string,
  seed: number,
): Promise<OrderedPickerGifts> {
  const supabase = createAdminClient();
  const { data: gifts, error: giftError } = await supabase
    .from('gifts')
    .select('id, created_at, currency, price_pence')
    .eq('owner_member_id', recipientMemberId)
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true });

  if (giftError) {
    throw giftError;
  }

  const giftIds = (gifts ?? []).map((gift) => gift.id);

  if (giftIds.length === 0) {
    return {
      orderedGiftIds: [],
      activeClaimGiftIds: new Set(),
      priceByGiftId: new Map(),
    };
  }

  const { data: claims, error: claimError } = await supabase
    .from('claims')
    .select('gift_id')
    .in('gift_id', giftIds)
    .in('status', ['reserved', 'purchased']);

  if (claimError) {
    throw claimError;
  }

  const priceByGiftId = new Map(
    (gifts ?? []).map((gift) => [
      gift.id,
      {
        pricePence: gift.price_pence,
        currency: isCurrencyCode(gift.currency) ? gift.currency : DEFAULT_CURRENCY,
      },
    ]),
  );

  return {
    orderedGiftIds: shuffleGiftIds(giftIds, seed),
    activeClaimGiftIds: new Set((claims ?? []).map((claim) => claim.gift_id)),
    priceByGiftId,
  };
}

export async function getPickerGridView(
  visit: PickerVisitView,
  eventId: string,
): Promise<PickerGridView> {
  const { orderedGiftIds, activeClaimGiftIds, priceByGiftId } =
    await getOrderedPickerGifts(visit.recipientMemberId, eventId, visit.seed);
  const peeked = new Set(visit.peekedGiftIds);

  const boxes: MysteryBoxView[] = orderedGiftIds.map((giftId, index) => {
    const price = priceByGiftId.get(giftId);

    if (activeClaimGiftIds.has(giftId)) {
      return {
        number: index + 1,
        state: 'taken',
        pricePence: null,
        currency: price?.currency ?? DEFAULT_CURRENCY,
      };
    }

    return {
      number: index + 1,
      state: peeked.has(giftId) ? 'peeked' : 'mystery',
      pricePence: price?.pricePence ?? null,
      currency: price?.currency ?? DEFAULT_CURRENCY,
    };
  });

  return {
    boxes,
    totalCount: orderedGiftIds.length,
    availableCount: orderedGiftIds.length - activeClaimGiftIds.size,
  };
}

/** The full list for List view. No claimer or claim fields are fetched. */
export async function getPickerListView(
  recipientMemberId: string,
  eventId: string,
): Promise<PickerListView> {
  const supabase = createAdminClient();
  const { data: gifts, error } = await supabase
    .from('gifts')
    .select('id, name, image_url, currency, price_pence, shop_url, priority')
    .eq('owner_member_id', recipientMemberId)
    .eq('event_id', eventId);

  if (error) {
    throw error;
  }

  const rows = gifts ?? [];
  const giftIds = rows.map((gift) => gift.id);
  const taken = new Set<string>();

  if (giftIds.length > 0) {
    const { data: claims, error: claimError } = await supabase
      .from('claims')
      .select('gift_id')
      .in('gift_id', giftIds)
      .in('status', ['reserved', 'purchased']);

    if (claimError) {
      throw claimError;
    }

    for (const claim of claims ?? []) {
      taken.add(claim.gift_id);
    }
  }

  const items: PickerListItemView[] = rows.map((gift) => ({
    id: gift.id,
    name: gift.name,
    imageUrl: gift.image_url,
    pricePence: gift.price_pence,
    currency: isCurrencyCode(gift.currency) ? gift.currency : DEFAULT_CURRENCY,
    shopName: shopNameFromUrl(gift.shop_url),
    shopUrl: gift.shop_url,
    priority: gift.priority === PRIORITY_REALLY_WANT,
    taken: taken.has(gift.id),
  }));

  items.sort((first, second) => {
    if (first.pricePence === null && second.pricePence !== null) {
      return 1;
    }

    if (first.pricePence !== null && second.pricePence === null) {
      return -1;
    }

    if (
      first.pricePence !== null &&
      second.pricePence !== null &&
      first.pricePence !== second.pricePence
    ) {
      return first.pricePence - second.pricePence;
    }

    return first.name.localeCompare(second.name);
  });

  return {
    items,
    totalCount: items.length,
    availableCount: items.filter((item) => !item.taken).length,
  };
}

/** One gift for the list's no-animation details screen. */
export async function getPickerGiftDetail(
  giftId: string,
  recipientMemberId: string,
  eventId: string,
): Promise<RevealedGiftView | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('gifts')
    .select('id, name, description, image_url, currency, price_pence, shop_url, preferences, priority')
    .eq('id', giftId)
    .eq('owner_member_id', recipientMemberId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toRevealedGift(data) : null;
}

async function markBoxPeeked(visit: PickerVisitView, giftId: string): Promise<void> {
  if (visit.peekedGiftIds.includes(giftId)) {
    return;
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('picker_visits')
    .update({ peeked_gift_ids: [...visit.peekedGiftIds, giftId] })
    .eq('id', visit.id);

  if (error) {
    throw error;
  }
}

/**
 * Reveal exactly one gift. The caller never receives the number-to-gift map or
 * the rest of the list, and taken boxes carry no gift details.
 */
export async function getReveal(
  visit: PickerVisitView,
  eventId: string,
  number: number,
): Promise<RevealResult> {
  const allowed = await consumeRevealAttempt(
    visit.buyerMemberId,
    REVEAL_LIMIT,
    REVEAL_WINDOW_SECONDS,
  );

  if (!allowed) {
    return { ok: false, reason: 'rate_limited' };
  }

  const { orderedGiftIds, activeClaimGiftIds } = await getOrderedPickerGifts(
    visit.recipientMemberId,
    eventId,
    visit.seed,
  );
  const giftId = orderedGiftIds[number - 1];

  if (!giftId) {
    return { ok: false, reason: 'not_found' };
  }

  if (activeClaimGiftIds.has(giftId)) {
    return { ok: false, reason: 'taken' };
  }

  const supabase = createAdminClient();
  const { data: gift, error } = await supabase
    .from('gifts')
    .select('id, name, description, image_url, currency, price_pence, shop_url, preferences, priority')
    .eq('id', giftId)
    .eq('owner_member_id', visit.recipientMemberId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!gift) {
    return { ok: false, reason: 'not_found' };
  }

  await markBoxPeeked(visit, giftId);

  return { ok: true, gift: toRevealedGift(gift) };
}

/** Record one reveal and report whether the member is inside their limit. */
export async function consumeRevealAttempt(
  memberId: string,
  limit: number = REVEAL_LIMIT,
  windowSeconds: number = REVEAL_WINDOW_SECONDS,
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('consume_reveal_attempt', {
    p_member_id: memberId,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    throw error;
  }

  return data === true;
}

/**
 * Claim the gift behind a revealed number. The gift id is resolved from the
 * server-held visit, and the database function makes the final atomic check.
 */
export async function claimFromVisit(
  viewer: Viewer,
  visit: PickerVisitView,
  eventId: string,
  number: number,
): Promise<ClaimResult> {
  const { orderedGiftIds } = await getOrderedPickerGifts(
    visit.recipientMemberId,
    eventId,
    visit.seed,
  );
  const giftId = orderedGiftIds[number - 1];

  if (!giftId) {
    return { ok: false, reason: 'not_found' };
  }

  const supabase = createAdminClient();
  const { data: freshVisit, error: visitError } = await supabase
    .from('picker_visits')
    .select('peeked_gift_ids')
    .eq('id', visit.id)
    .maybeSingle();

  if (visitError) {
    throw visitError;
  }

  if (!freshVisit || !freshVisit.peeked_gift_ids.includes(giftId)) {
    return { ok: false, reason: 'not_revealed' };
  }

  const { data: gift, error: giftError } = await supabase
    .from('gifts')
    .select('name, description, image_url, currency, price_pence, shop_url, preferences, priority')
    .eq('id', giftId)
    .eq('owner_member_id', visit.recipientMemberId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (giftError) {
    throw giftError;
  }

  if (!gift) {
    return { ok: false, reason: 'not_found' };
  }

  const snapshot = {
    name: gift.name,
    description: gift.description,
    image_url: gift.image_url,
    currency: gift.currency,
    price_pence: gift.price_pence,
    shop_url: gift.shop_url,
    preferences: gift.preferences,
    priority: gift.priority,
  };

  const { data, error } = await supabase.rpc('claim_gift', {
    p_gift_id: giftId,
    p_claimer_member_id: viewer.member.id,
    p_family_id: viewer.family.id,
    p_snapshot: snapshot,
  });

  if (error) {
    throw error;
  }

  if (data === 'ok') {
    return { ok: true };
  }

  if (data === 'already_picked') {
    return { ok: false, reason: 'already_picked' };
  }

  return { ok: false, reason: data === 'not_found' ? 'not_found' : 'not_allowed' };
}

/**
 * Claim a gift directly from List view. The gift is scoped to the viewer's
 * active event and family, and the database still makes the atomic check.
 */
export async function claimFromGiftId(
  viewer: Viewer,
  giftId: string,
  eventId: string,
): Promise<ClaimResult> {
  if (!UUID_PATTERN.test(giftId)) {
    return { ok: false, reason: 'not_found' };
  }

  const supabase = createAdminClient();
  const { data: gift, error: giftError } = await supabase
    .from('gifts')
    .select(
      'owner_member_id, name, description, image_url, currency, price_pence, shop_url, preferences, priority',
    )
    .eq('id', giftId)
    .eq('event_id', eventId)
    .maybeSingle();

  if (giftError) {
    throw giftError;
  }

  if (!gift) {
    return { ok: false, reason: 'not_found' };
  }

  if (gift.owner_member_id === viewer.member.id) {
    return { ok: false, reason: 'not_allowed' };
  }

  const { data: owner, error: ownerError } = await supabase
    .from('members')
    .select('family_id')
    .eq('id', gift.owner_member_id)
    .maybeSingle();

  if (ownerError) {
    throw ownerError;
  }

  if (!owner || owner.family_id !== viewer.family.id) {
    return { ok: false, reason: 'not_found' };
  }

  const snapshot = {
    name: gift.name,
    description: gift.description,
    image_url: gift.image_url,
    currency: gift.currency,
    price_pence: gift.price_pence,
    shop_url: gift.shop_url,
    preferences: gift.preferences,
    priority: gift.priority,
  };

  const { data, error } = await supabase.rpc('claim_gift', {
    p_gift_id: giftId,
    p_claimer_member_id: viewer.member.id,
    p_family_id: viewer.family.id,
    p_snapshot: snapshot,
  });

  if (error) {
    throw error;
  }

  if (data === 'ok') {
    return { ok: true };
  }

  if (data === 'already_picked') {
    return { ok: false, reason: 'already_picked' };
  }

  return { ok: false, reason: data === 'not_found' ? 'not_found' : 'not_allowed' };
}
