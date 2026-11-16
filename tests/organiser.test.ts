import { describe, expect, it } from 'vitest';
import { getViewerByToken } from '@/lib/auth';
import { createAdminClient } from '@/lib/db/client';
import { createFamilyRecord } from '@/lib/db/families';
import {
  archiveEventRecord,
  createNextEventRecord,
  getNextEventName,
  updateFamilySettings,
} from '@/lib/db/organiser';
import {
  createInviteCode,
  createPersonalToken,
  hashPersonalToken,
} from '@/lib/tokens';
import { cleanupFamily } from './family-fixture';

describe('organiser settings', () => {
  it('renames the family, changes approval, and moves events forward', async () => {
    const token = createPersonalToken();
    const created = await createFamilyRecord({
      familyName: `Organiser Test ${crypto.randomUUID().slice(0, 8)}`,
      memberName: 'Mum',
      requiresApproval: false,
      inviteCode: createInviteCode(),
      tokenHash: hashPersonalToken(token),
      eventName: 'Christmas 2026',
    });

    try {
      const renamed = await updateFamilySettings({
        familyId: created.familyId,
        organiserMemberId: created.memberId,
        name: 'The Test Family Christmas',
        requiresApproval: true,
      });
      expect(renamed).toBe('ok');

      const viewer = await getViewerByToken(token);
      expect(viewer?.family.name).toBe('The Test Family Christmas');
      expect(viewer?.family.requiresApproval).toBe(true);
      expect(viewer?.event?.name).toBe('Christmas 2026');

      expect(await getNextEventName(created.familyId)).toBe('Christmas 2027');

      const next = await createNextEventRecord(
        created.familyId,
        created.memberId,
        'Christmas 2027',
      );
      expect(next.eventName).toBe('Christmas 2027');

      const afterNewEvent = await getViewerByToken(token);
      expect(afterNewEvent?.event?.name).toBe('Christmas 2027');

      expect(await getNextEventName(created.familyId)).toBe('Christmas 2028');

      const archive = await archiveEventRecord(
        next.eventId,
        created.familyId,
        created.memberId,
      );
      expect(archive).toBe('ok');

      const afterArchive = await getViewerByToken(token);
      expect(afterArchive?.event).toBeNull();

      const supabase = createAdminClient();
      const { data: events } = await supabase
        .from('events')
        .select('name, status')
        .eq('family_id', created.familyId)
        .order('created_at', { ascending: true });

      expect(events).toEqual([
        { name: 'Christmas 2026', status: 'archived' },
        { name: 'Christmas 2027', status: 'archived' },
      ]);
    } finally {
      await cleanupFamily(created.familyId);
    }
  });

  it('refuses settings changes from someone who is not the organiser', async () => {
    const token = createPersonalToken();
    const created = await createFamilyRecord({
      familyName: `Organiser Test ${crypto.randomUUID().slice(0, 8)}`,
      memberName: 'Mum',
      requiresApproval: false,
      inviteCode: createInviteCode(),
      tokenHash: hashPersonalToken(token),
      eventName: 'Christmas 2026',
    });

    try {
      const result = await updateFamilySettings({
        familyId: created.familyId,
        organiserMemberId: crypto.randomUUID(),
        name: 'Hijacked',
      });
      expect(result).toBe('not_allowed');
    } finally {
      await cleanupFamily(created.familyId);
    }
  });
});
