import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  listMyClaims,
  listMyNotices,
  updateMyClaim,
} from '@/lib/db/claims';
import {
  claimFromVisit,
  getOrCreatePickerVisit,
  getPickerGridView,
  getPickerVisitForBuyer,
  getReveal,
} from '@/lib/db/picker';
import { deleteOwnGiftRecord, listOwnGifts, updateOwnGiftRecord } from '@/lib/db/gifts';
import {
  activeClaimsForGift,
  allClaimsForGift,
  cleanupFamily,
  createTestFamily,
  type TestFamily,
} from './family-fixture';

describe('claims and overlapping actions', () => {
  let family: TestFamily;

  beforeEach(async () => {
    family = await createTestFamily(['Nike Air Max Trainers']);
  });

  afterEach(async () => {
    await cleanupFamily(family.familyId);
  });

  it('reveals the same gift twice in one visit and keeps the box Peeked', async () => {
    const visit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!visit) {
      throw new Error('Expected a picker visit.');
    }

    const first = await getReveal(visit, family.eventId, 1);
    const second = await getReveal(visit, family.eventId, 1);
    expect(first.ok && second.ok).toBe(true);

    if (!first.ok || !second.ok) {
      return;
    }

    expect(second.gift).toEqual(first.gift);

    const refreshedVisit = await getPickerVisitForBuyer(
      visit.id,
      family.viewers.james.member.id,
    );
    if (!refreshedVisit) {
      throw new Error('Expected the visit to still exist.');
    }

    const grid = await getPickerGridView(refreshedVisit, family.eventId);
    expect(grid.boxes[0]).toEqual({
      number: 1,
      state: 'peeked',
      pricePence: 9500,
      currency: 'GBP',
    });
  });

  it('refuses a claim before the number has been revealed', async () => {
    const visit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!visit) {
      throw new Error('Expected a picker visit.');
    }

    const result = await claimFromVisit(family.viewers.james, visit, family.eventId, 1);
    expect(result).toEqual({ ok: false, reason: 'not_revealed' });
    expect(await activeClaimsForGift(family.giftIds[0])).toHaveLength(0);
  });

  it('does not let a member claim their own gift', async () => {
    const visit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.sarah.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!visit) {
      throw new Error('Expected a picker visit.');
    }

    const reveal = await getReveal(visit, family.eventId, 1);
    expect(reveal.ok).toBe(true);

    const result = await claimFromVisit(family.viewers.sarah, visit, family.eventId, 1);
    expect(result).toEqual({ ok: false, reason: 'not_allowed' });
    expect(await activeClaimsForGift(family.giftIds[0])).toHaveLength(0);
  });

  it('makes the box Taken once every gift is claimed', async () => {
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

    const refreshedVisit = await getPickerVisitForBuyer(
      visit.id,
      family.viewers.james.member.id,
    );
    if (!refreshedVisit) {
      throw new Error('Expected the visit to still exist.');
    }

    const grid = await getPickerGridView(refreshedVisit, family.eventId);
    expect(grid.availableCount).toBe(0);
    expect(grid.boxes[0]).toEqual({
      number: 1,
      state: 'taken',
      pricePence: null,
      currency: 'GBP',
    });
  });

  it('keeps one active claim per gift under two simultaneous claims', async () => {
    const jamesVisit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });
    const dadVisit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.dad.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!jamesVisit || !dadVisit) {
      throw new Error('Expected both picker visits.');
    }

    await Promise.all([
      getReveal(jamesVisit, family.eventId, 1),
      getReveal(dadVisit, family.eventId, 1),
    ]);

    const results = await Promise.all([
      claimFromVisit(family.viewers.james, jamesVisit, family.eventId, 1),
      claimFromVisit(family.viewers.dad, dadVisit, family.eventId, 1),
    ]);

    const successes = results.filter((result) => result.ok);
    const failures = results.filter((result) => !result.ok);

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toEqual({ ok: false, reason: 'already_picked' });
    expect(await activeClaimsForGift(family.giftIds[0])).toHaveLength(1);
  });

  it('releases a claim back to the pool, then another member can claim it', async () => {
    const jamesVisit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });
    const dadVisit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.dad.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!jamesVisit || !dadVisit) {
      throw new Error('Expected both picker visits.');
    }

    await Promise.all([
      getReveal(jamesVisit, family.eventId, 1),
      getReveal(dadVisit, family.eventId, 1),
    ]);

    const firstClaim = await claimFromVisit(
      family.viewers.james,
      jamesVisit,
      family.eventId,
      1,
    );
    expect(firstClaim.ok).toBe(true);

    const [active] = await activeClaimsForGift(family.giftIds[0]);
    expect(active.status).toBe('reserved');

    const released = await updateMyClaim(active.id, family.viewers.james.member.id, 'release');
    expect(released).toBe('ok');
    expect(await activeClaimsForGift(family.giftIds[0])).toHaveLength(0);
    expect(await listMyClaims(family.viewers.james.member.id)).toHaveLength(0);

    const secondClaim = await claimFromVisit(
      family.viewers.dad,
      dadVisit,
      family.eventId,
      1,
    );
    expect(secondClaim.ok).toBe(true);

    const [newActive] = await activeClaimsForGift(family.giftIds[0]);
    expect(newActive.claimer_member_id).toBe(family.viewers.dad.member.id);
    expect(await listMyClaims(family.viewers.dad.member.id)).toHaveLength(1);
    expect(await listMyClaims(family.viewers.james.member.id)).toHaveLength(0);
  });

  it('deletes a claimed gift, removes the claim and notices the affected buyer', async () => {
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
    expect(await activeClaimsForGift(family.giftIds[0])).toHaveLength(1);

    const deleted = await deleteOwnGiftRecord(
      family.giftIds[0],
      family.viewers.sarah.member.id,
    );
    expect(deleted).toBe('ok');
    expect(await allClaimsForGift(family.giftIds[0])).toHaveLength(0);

    const notices = await listMyNotices(family.viewers.james.member.id);
    expect(notices).toHaveLength(1);
    expect(notices[0].message).toContain('Nike Air Max Trainers');
    expect(notices[0].message).toContain('Sarah');
    expect(notices[0].message).not.toContain('James');

    const otherNotices = await listMyNotices(family.viewers.dad.member.id);
    expect(otherNotices).toHaveLength(0);
  });

  it('refuses to delete someone else’s gift', async () => {
    const deleted = await deleteOwnGiftRecord(
      family.giftIds[0],
      family.viewers.james.member.id,
    );
    expect(deleted).toBe('not_allowed');
    expect(await listOwnGifts(family.viewers.sarah.member.id, family.eventId)).toHaveLength(1);
  });

  it('keeps the original snapshot when the owner later edits the gift', async () => {
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

    const edited = await updateOwnGiftRecord(
      family.giftIds[0],
      family.viewers.sarah.member.id,
      family.eventId,
      {
        name: 'Nike Air Max Trainers (new season)',
        description: 'A different colour now',
        imageUrl: null,
        currency: 'AUD',
        pricePence: 12000,
        shopUrl: null,
        preferences: 'White, Size 7',
        priority: false,
      },
    );
    expect(edited).toBe('ok');

    const claims = await listMyClaims(family.viewers.james.member.id);
    expect(claims[0].gift.name).toBe('Nike Air Max Trainers');
    expect(claims[0].gift.preferences).toBe('Black, Size 6');
    expect(claims[0].gift.pricePence).toBe(9500);
    expect(claims[0].gift.currency).toBe('GBP');
  });
});
