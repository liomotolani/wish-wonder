import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createGiftRecord, listOwnGifts } from '@/lib/db/gifts';
import {
  createManagedMemberRecord,
  getManagedMember,
  listManagedMembers,
  removeFamilyMemberRecord,
} from '@/lib/db/members';
import {
  cleanupFamily,
  createTestFamily,
  sampleGift,
  type TestFamily,
} from './family-fixture';

describe('managed lists', () => {
  let family: TestFamily;

  beforeEach(async () => {
    family = await createTestFamily();
  });

  afterEach(async () => {
    await cleanupFamily(family.familyId);
  });

  it('lets a member add and manage a person without a phone', async () => {
    const managedId = await createManagedMemberRecord({
      familyId: family.familyId,
      managerMemberId: family.viewers.mum.member.id,
      displayName: 'Baby Leo',
    });

    const managed = await getManagedMember(
      managedId,
      family.viewers.mum.member.id,
      family.familyId,
    );
    expect(managed?.displayName).toBe('Baby Leo');

    const notTheirManager = await getManagedMember(
      managedId,
      family.viewers.dad.member.id,
      family.familyId,
    );
    expect(notTheirManager).toBeNull();

    const managedLists = await listManagedMembers(
      family.viewers.mum.member.id,
      family.familyId,
    );
    expect(managedLists.map((member) => member.displayName)).toEqual(['Baby Leo']);

    const giftId = await createGiftRecord(
      family.eventId,
      managedId,
      sampleGift({ name: 'Wooden stacking rings' }),
    );
    expect(giftId).toBeTruthy();

    const gifts = await listOwnGifts(managedId, family.eventId);
    expect(gifts.map((gift) => gift.name)).toEqual(['Wooden stacking rings']);
    expect(JSON.stringify(gifts)).not.toContain('claim');
  });

  it('enforces unique names within the family', async () => {
    await createManagedMemberRecord({
      familyId: family.familyId,
      managerMemberId: family.viewers.mum.member.id,
      displayName: 'Baby Leo',
    });

    await expect(
      createManagedMemberRecord({
        familyId: family.familyId,
        managerMemberId: family.viewers.dad.member.id,
        displayName: 'baby leo',
      }),
    ).rejects.toBeTruthy();
  });

  it('hands managed people to the organiser when their manager is removed', async () => {
    const managedId = await createManagedMemberRecord({
      familyId: family.familyId,
      managerMemberId: family.viewers.dad.member.id,
      displayName: 'Cousin Ada',
    });

    expect(
      await getManagedMember(managedId, family.viewers.dad.member.id, family.familyId),
    ).not.toBeNull();

    const removed = await removeFamilyMemberRecord(
      family.viewers.dad.member.id,
      family.familyId,
      family.viewers.mum.member.id,
    );
    expect(removed).toBe('ok');

    expect(
      await getManagedMember(managedId, family.viewers.mum.member.id, family.familyId),
    ).not.toBeNull();
    expect(
      await getManagedMember(managedId, family.viewers.dad.member.id, family.familyId),
    ).toBeNull();
  });
});
