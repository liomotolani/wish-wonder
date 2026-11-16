import { describe, expect, it } from 'vitest';
import { getViewerByToken } from '@/lib/auth';
import { createFamilyRecord, joinFamilyRecord } from '@/lib/db/families';
import { approvePendingMember, listPendingMembers } from '@/lib/db/members';
import {
  createInviteCode,
  createPersonalToken,
  hashPersonalToken,
} from '@/lib/tokens';
import { cleanupFamily } from './family-fixture';

describe('join approval', () => {
  it('only lets the organiser approve a waiting member', async () => {
    const inviteCode = createInviteCode();
    const mumToken = createPersonalToken();
    const sarahToken = createPersonalToken();

    const created = await createFamilyRecord({
      familyName: `Approval Family ${crypto.randomUUID().slice(0, 8)}`,
      memberName: 'Mum',
      requiresApproval: true,
      inviteCode,
      tokenHash: hashPersonalToken(mumToken),
      eventName: 'Christmas 2026',
    });

    try {
      const joined = await joinFamilyRecord(
        inviteCode,
        'Sarah',
        hashPersonalToken(sarahToken),
      );
      expect(joined.ok).toBe(true);

      if (!joined.ok) {
        return;
      }

      expect(joined.memberStatus).toBe('pending');

      const sarahBefore = await getViewerByToken(sarahToken);
      expect(sarahBefore?.member.status).toBe('pending');

      const pending = await listPendingMembers(created.familyId);
      expect(pending.map((member) => member.displayName)).toEqual(['Sarah']);

      const selfApproval = await approvePendingMember(
        joined.memberId,
        created.familyId,
        joined.memberId,
      );
      expect(selfApproval).toBe('not_allowed');

      const approved = await approvePendingMember(
        joined.memberId,
        created.familyId,
        created.memberId,
      );
      expect(approved).toBe('ok');

      const sarahAfter = await getViewerByToken(sarahToken);
      expect(sarahAfter?.member.status).toBe('active');

      expect(await listPendingMembers(created.familyId)).toHaveLength(0);
      expect(
        await approvePendingMember(joined.memberId, created.familyId, created.memberId),
      ).toBe('not_found');
    } finally {
      await cleanupFamily(created.familyId);
    }
  });
});
