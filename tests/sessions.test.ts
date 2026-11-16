import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getViewerByToken } from '@/lib/auth';
import { getDashboardData } from '@/lib/db/dashboard';
import {
  createDeviceLinkRecord,
  redeemDeviceLinkRecord,
} from '@/lib/db/device-links';
import { listMyClaims, listMyNotices } from '@/lib/db/claims';
import { listOwnGifts } from '@/lib/db/gifts';
import {
  reissueMemberLinkRecord,
  removeFamilyMemberRecord,
} from '@/lib/db/members';
import {
  claimFromVisit,
  getOrCreatePickerVisit,
  getReveal,
} from '@/lib/db/picker';
import { createAdminClient } from '@/lib/db/client';
import {
  createPersonalToken,
  hashPersonalToken,
} from '@/lib/tokens';
import {
  cleanupFamily,
  createTestFamily,
  type TestFamily,
} from './family-fixture';

function expectNoClaimLeak(value: unknown): void {
  const json = JSON.stringify(value);
  for (const key of ['claimer', 'claimerMemberId', 'snapshot', 'gift_snapshot']) {
    expect(json).not.toContain(key);
  }
}

describe('sessions, device links and link reissue', () => {
  let family: TestFamily;

  beforeEach(async () => {
    family = await createTestFamily(['Nike Air Max Trainers']);
  });

  afterEach(async () => {
    await cleanupFamily(family.familyId);
  });

  it('signs another device in once without signing the first device out', async () => {
    const linkToken = createPersonalToken();
    const sessionToken = createPersonalToken();
    const expiresAt = new Date(Date.now() + 60_000).toISOString();

    await createDeviceLinkRecord({
      memberId: family.viewers.james.member.id,
      tokenHash: hashPersonalToken(linkToken),
      expiresAt,
    });

    const used = await redeemDeviceLinkRecord(
      hashPersonalToken(linkToken),
      hashPersonalToken(sessionToken),
    );
    expect(used).toEqual({
      ok: true,
      memberId: family.viewers.james.member.id,
      memberStatus: 'active',
    });

    const newDeviceViewer = await getViewerByToken(sessionToken);
    const originalViewer = await getViewerByToken(family.tokens.james);
    expect(newDeviceViewer?.member.displayName).toBe('James');
    expect(originalViewer?.member.displayName).toBe('James');

    const secondUse = await redeemDeviceLinkRecord(
      hashPersonalToken(linkToken),
      hashPersonalToken(createPersonalToken()),
    );
    expect(secondUse).toEqual({ ok: false, reason: 'used' });

    const supabase = createAdminClient();
    const { data: rawRows } = await supabase
      .from('device_links')
      .select('id')
      .eq('token_hash', linkToken);
    expect(rawRows).toHaveLength(0);

    const { data: hashedRows } = await supabase
      .from('device_links')
      .select('id')
      .eq('token_hash', hashPersonalToken(linkToken));
    expect(hashedRows).toHaveLength(1);

    expectNoClaimLeak({ viewer: newDeviceViewer, used });
  });

  it('refuses a device link after it expires', async () => {
    const linkToken = createPersonalToken();
    await createDeviceLinkRecord({
      memberId: family.viewers.james.member.id,
      tokenHash: hashPersonalToken(linkToken),
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });

    const used = await redeemDeviceLinkRecord(
      hashPersonalToken(linkToken),
      hashPersonalToken(createPersonalToken()),
    );
    expect(used).toEqual({ ok: false, reason: 'expired' });
  });

  it('reissue signs every existing device out and leaves one new link', async () => {
    const sarahDeviceLinkToken = createPersonalToken();
    const sarahDeviceSessionToken = createPersonalToken();
    const unusedDeviceLink = createPersonalToken();

    await createDeviceLinkRecord({
      memberId: family.viewers.sarah.member.id,
      tokenHash: hashPersonalToken(sarahDeviceLinkToken),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    await createDeviceLinkRecord({
      memberId: family.viewers.sarah.member.id,
      tokenHash: hashPersonalToken(unusedDeviceLink),
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
    await redeemDeviceLinkRecord(
      hashPersonalToken(sarahDeviceLinkToken),
      hashPersonalToken(sarahDeviceSessionToken),
    );

    expect(await getViewerByToken(family.tokens.sarah)).not.toBeNull();
    expect(await getViewerByToken(sarahDeviceSessionToken)).not.toBeNull();

    const newToken = createPersonalToken();
    const result = await reissueMemberLinkRecord(
      family.viewers.sarah.member.id,
      family.familyId,
      family.viewers.mum.member.id,
      hashPersonalToken(newToken),
    );
    expect(result).toBe('ok');

    expect(await getViewerByToken(family.tokens.sarah)).toBeNull();
    expect(await getViewerByToken(sarahDeviceSessionToken)).toBeNull();
    expect(await getViewerByToken(family.tokens.mum)).not.toBeNull();
    expect(await getViewerByToken(family.tokens.dad)).not.toBeNull();

    const newViewer = await getViewerByToken(newToken);
    expect(newViewer?.member.displayName).toBe('Sarah');

    const invalidatedDeviceLink = await redeemDeviceLinkRecord(
      hashPersonalToken(unusedDeviceLink),
      hashPersonalToken(createPersonalToken()),
    );
    expect(invalidatedDeviceLink).toEqual({ ok: false, reason: 'used' });

    const supabase = createAdminClient();
    const { data: sarahSessions } = await supabase
      .from('member_sessions')
      .select('revoked_at')
      .eq('member_id', family.viewers.sarah.member.id);

    expect(sarahSessions?.filter((session) => session.revoked_at === null)).toHaveLength(1);

    const forbidden = await reissueMemberLinkRecord(
      family.viewers.sarah.member.id,
      family.familyId,
      family.viewers.dad.member.id,
      hashPersonalToken(createPersonalToken()),
    );
    expect(forbidden).toBe('not_allowed');
  });

  it('removes a member, their gifts and claims, and notices affected buyers', async () => {
    const visit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!visit) {
      throw new Error('Expected a picker visit.');
    }

    const reveal = await getReveal(visit, family.eventId, 1);
    expect(reveal.ok).toBe(true);
    const claim = await claimFromVisit(family.viewers.james, visit, family.eventId, 1);
    expect(claim.ok).toBe(true);
    expect(await listMyClaims(family.viewers.james.member.id)).toHaveLength(1);

    const forbidden = await removeFamilyMemberRecord(
      family.viewers.sarah.member.id,
      family.familyId,
      family.viewers.dad.member.id,
    );
    expect(forbidden).toBe('not_allowed');

    const selfRemoval = await removeFamilyMemberRecord(
      family.viewers.mum.member.id,
      family.familyId,
      family.viewers.mum.member.id,
    );
    expect(selfRemoval).toBe('not_allowed');

    const removed = await removeFamilyMemberRecord(
      family.viewers.sarah.member.id,
      family.familyId,
      family.viewers.mum.member.id,
    );
    expect(removed).toBe('ok');

    expect(await getViewerByToken(family.tokens.sarah)).toBeNull();
    expect(await listMyClaims(family.viewers.james.member.id)).toHaveLength(0);

    const notices = await listMyNotices(family.viewers.james.member.id);
    expect(notices).toHaveLength(1);
    expect(notices[0].message).toContain('Sarah');
    expect(notices[0].message).toContain('Nike Air Max Trainers');

    const supabase = createAdminClient();
    const { data: remainingGifts } = await supabase
      .from('gifts')
      .select('id')
      .eq('event_id', family.eventId);
    expect(remainingGifts).toHaveLength(0);

    expectNoClaimLeak({ removed, notices });
  });

  it('keeps recipient gift data free of claims after a session change', async () => {
    const newToken = createPersonalToken();
    await reissueMemberLinkRecord(
      family.viewers.sarah.member.id,
      family.familyId,
      family.viewers.mum.member.id,
      hashPersonalToken(newToken),
    );

    const sarahViewer = await getViewerByToken(newToken);
    if (!sarahViewer) {
      throw new Error('Expected the new session to work.');
    }

    const gifts = await listOwnGifts(sarahViewer.member.id, family.eventId);
    expect(gifts).toHaveLength(1);
    expectNoClaimLeak(gifts);
    expect(JSON.stringify(gifts)).not.toContain('claim');

    const dashboard = await getDashboardData(sarahViewer);
    expect(dashboard.reservedCount).toBe(0);
    expectNoClaimLeak(dashboard);
  });
});
