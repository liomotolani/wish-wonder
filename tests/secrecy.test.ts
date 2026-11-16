import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST as revealRoute } from '@/app/api/picker/reveal/route';
import { createAdminClient } from '@/lib/db/client';
import {
  getDashboardData,
} from '@/lib/db/dashboard';
import { listOwnGifts } from '@/lib/db/gifts';
import { listMyClaims } from '@/lib/db/claims';
import {
  claimFromVisit,
  getOrCreatePickerVisit,
  getPickerGridView,
  getReveal,
} from '@/lib/db/picker';
import {
  cleanupFamily,
  createTestFamily,
  type TestFamily,
} from './family-fixture';
const FORBIDDEN_CLAIM_KEYS = [
  'claimer',
  'claimerMemberId',
  'claimedBy',
  'claimId',
  'snapshot',
  'token',
  'gift_snapshot',
  'giftId',
  'gift_id',
];

function expectNoClaimLeak(value: unknown): void {
  const json = JSON.stringify(value);
  for (const key of FORBIDDEN_CLAIM_KEYS) {
    expect(json).not.toContain(key);
  }
}

describe('surprise protection', () => {
  let family: TestFamily;

  beforeEach(async () => {
    family = await createTestFamily([
      'LEGO Technic set',
      'Football shirt',
      'Kindle Paperwhite',
    ]);
  });

  afterEach(async () => {
    await cleanupFamily(family.familyId);
  });

  it('sends the buyer only box numbers and states', async () => {
    const visit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    expect(visit).not.toBeNull();
    if (!visit) {
      return;
    }

    const grid = await getPickerGridView(visit, family.eventId);
    expect(grid.totalCount).toBe(3);
    expect(grid.availableCount).toBe(3);
    expect(grid.boxes.map((box) => box.state)).toEqual(['mystery', 'mystery', 'mystery']);

    const json = JSON.stringify(grid);
    for (const giftName of ['LEGO Technic set', 'Football shirt', 'Kindle Paperwhite']) {
      expect(json).not.toContain(giftName);
    }
    expectNoClaimLeak(grid);
    expect(json).not.toContain('status');
  });

  it('prefetches exactly one gift through the reveal route', async () => {
    const visit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    expect(visit).not.toBeNull();
    if (!visit) {
      return;
    }

    const response = await revealRoute(
      new Request('http://localhost/api/picker/reveal', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: `ww_member=${family.tokens.james}`,
        },
        body: JSON.stringify({ visitId: visit.id, number: 1 }),
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as {
      ok: boolean;
      recipientName: string;
      gift: Record<string, unknown>;
    };
    expect(data.ok).toBe(true);
    expect(data.recipientName).toBe('Sarah');
    expect(Object.keys(data.gift).sort()).toEqual([
      'description',
      'imageUrl',
      'name',
      'preferences',
      'pricePence',
      'priority',
      'shopUrl',
    ]);
    expectNoClaimLeak(data);

    const unauthorised = await revealRoute(
      new Request('http://localhost/api/picker/reveal', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ visitId: visit.id, number: 1 }),
      }),
    );
    expect(unauthorised.status).toBe(401);
  });

  it('reveals exactly one gift and never the list or a claim', async () => {
    const visit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!visit) {
      throw new Error('Expected a picker visit.');
    }

    const result = await getReveal(visit, family.eventId, 1);
    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.gift.name).toBeTruthy();
    expect(Object.keys(result.gift).sort()).toEqual(
      [
        'description',
        'imageUrl',
        'name',
        'preferences',
        'pricePence',
        'priority',
        'shopUrl',
      ].sort(),
    );

    expectNoClaimLeak(result.gift);
    const otherGiftNames = ['LEGO Technic set', 'Football shirt', 'Kindle Paperwhite'].filter(
      (name) => name !== result.gift.name,
    );
    for (const otherName of otherGiftNames) {
      expect(JSON.stringify(result)).not.toContain(otherName);
    }
  });

  it('never sends claim data to the recipient viewing her own list', async () => {
    const visit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!visit) {
      throw new Error('Expected a picker visit.');
    }

    await getReveal(visit, family.eventId, 1);
    const claim = await claimFromVisit(family.viewers.james, visit, family.eventId, 1);
    expect(claim.ok).toBe(true);

    const ownGifts = await listOwnGifts(family.viewers.sarah.member.id, family.eventId);
    expect(ownGifts).toHaveLength(3);
    expectNoClaimLeak(ownGifts);
    expect(JSON.stringify(ownGifts)).not.toContain('status');

    const dashboard = await getDashboardData(family.viewers.sarah);
    expect(dashboard.reservedCount).toBe(0);
    expect(dashboard.purchasedCount).toBe(0);
    expectNoClaimLeak(dashboard);
    expect(JSON.stringify(dashboard)).not.toContain('status');
  });

  it('shows another buyer Taken numbers without gift details or the claimer', async () => {
    const jamesVisit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!jamesVisit) {
      throw new Error('Expected a picker visit.');
    }

    const reveal = await getReveal(jamesVisit, family.eventId, 1);
    if (!reveal.ok) {
      throw new Error('Expected a gift reveal.');
    }

    const claim = await claimFromVisit(family.viewers.james, jamesVisit, family.eventId, 1);
    expect(claim.ok).toBe(true);

    const dadVisit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.dad.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!dadVisit) {
      throw new Error('Expected a picker visit.');
    }

    const dadGrid = await getPickerGridView(dadVisit, family.eventId);
    expect(dadGrid.availableCount).toBe(2);
    expect(dadGrid.boxes.filter((box) => box.state === 'taken')).toHaveLength(1);

    const json = JSON.stringify(dadGrid);
    expect(json).not.toContain(reveal.gift.name);
    expect(json).not.toContain('James');
    expect(json).not.toContain('status');
    expectNoClaimLeak(dadGrid);

    expect(await listMyClaims(family.viewers.dad.member.id)).toHaveLength(0);
    expect(await listMyClaims(family.viewers.sarah.member.id)).toHaveLength(0);
    expect(await listMyClaims(family.viewers.james.member.id)).toHaveLength(1);
  });

  it('stores only a hash of each personal link token', async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('member_sessions')
      .select('token_hash')
      .eq('token_hash', family.tokens.james);

    expect(error).toBeNull();
    expect(data).toHaveLength(0);

    const { data: sessions } = await supabase
      .from('member_sessions')
      .select('token_hash')
      .limit(50);

    expect((sessions ?? []).some((session) => session.token_hash === family.tokens.james)).toBe(
      false,
    );
  });
});
