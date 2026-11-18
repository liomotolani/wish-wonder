import { randomUUID } from 'node:crypto';
import { getViewerByToken } from '@/lib/auth';
import { createAdminClient } from '@/lib/db/client';
import { createFamilyRecord, joinFamilyRecord } from '@/lib/db/families';
import { createGiftRecord, type GiftInput } from '@/lib/db/gifts';
import {
  createInviteCode,
  createPersonalToken,
  hashPersonalToken,
} from '@/lib/tokens';
import type { Viewer } from '@/lib/types';

export interface TestFamily {
  familyId: string;
  eventId: string;
  inviteCode: string;
  tokens: Record<MemberKey, string>;
  viewers: Record<MemberKey, Viewer>;
  giftIds: string[];
}

export type MemberKey = 'mum' | 'dad' | 'sarah' | 'james';

const MEMBER_NAMES: Record<MemberKey, string> = {
  mum: 'Mum',
  dad: 'Dad',
  sarah: 'Sarah',
  james: 'James',
};

export function sampleGift(overrides: Partial<GiftInput> = {}): GiftInput {
  return {
    name: 'Nike Air Max Trainers',
    description: 'The classic ones, for everyday wear',
    imageUrl: null,
    currency: 'GBP',
    pricePence: 9500,
    shopUrl: 'https://example.com/trainers',
    preferences: 'Black, Size 6',
    priority: true,
    ...overrides,
  };
}

export async function createTestFamily(giftNames: string[] = []): Promise<TestFamily> {
  const suffix = randomUUID().slice(0, 8);
  const inviteCode = createInviteCode();
  const tokens: Partial<Record<MemberKey, string>> = {};
  const memberIds: Partial<Record<MemberKey, string>> = {};

  tokens.mum = createPersonalToken();
  const created = await createFamilyRecord({
    familyName: `Test Family ${suffix}`,
    memberName: MEMBER_NAMES.mum,
    requiresApproval: false,
    inviteCode,
    tokenHash: hashPersonalToken(tokens.mum),
    eventName: 'Christmas 2026',
  });
  memberIds.mum = created.memberId;

  for (const key of ['dad', 'sarah', 'james'] as const) {
    const token = createPersonalToken();
    const result = await joinFamilyRecord(
      inviteCode,
      MEMBER_NAMES[key],
      hashPersonalToken(token),
    );

    if (!result.ok) {
      throw new Error(`Could not add ${key} to the test family.`);
    }

    tokens[key] = token;
    memberIds[key] = result.memberId;
  }

  const viewers = {} as Record<MemberKey, Viewer>;

  for (const key of ['mum', 'dad', 'sarah', 'james'] as const) {
    const token = tokens[key];
    if (!token) {
      throw new Error(`Missing token for ${key}.`);
    }

    const viewer = await getViewerByToken(token);
    if (!viewer) {
      throw new Error(`Could not load viewer for ${key}.`);
    }

    viewers[key] = viewer;
  }

  const sarahId = memberIds.sarah;
  if (!sarahId) {
    throw new Error('Missing Sarah member id.');
  }

  const giftIds: string[] = [];
  for (const name of giftNames) {
    giftIds.push(
      await createGiftRecord(created.eventId, sarahId, sampleGift({ name })),
    );
  }

  return {
    familyId: created.familyId,
    eventId: created.eventId,
    inviteCode,
    tokens: tokens as Record<MemberKey, string>,
    viewers,
    giftIds,
  };
}

export async function cleanupFamily(familyId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from('families').delete().eq('id', familyId);
  if (error) {
    throw error;
  }
}

export async function activeClaimsForGift(giftId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('claims')
    .select('id, gift_id, claimer_member_id, status')
    .eq('gift_id', giftId)
    .in('status', ['reserved', 'purchased']);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function allClaimsForGift(giftId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('claims')
    .select('id, gift_id, claimer_member_id, status')
    .eq('gift_id', giftId);

  if (error) {
    throw error;
  }

  return data ?? [];
}
