import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  consumeRevealAttempt,
  getOrCreatePickerVisit,
  getReveal,
  REVEAL_LIMIT,
  REVEAL_WINDOW_SECONDS,
} from '@/lib/db/picker';
import {
  cleanupFamily,
  createTestFamily,
  type TestFamily,
} from './family-fixture';

describe('reveal rate limiting', () => {
  let family: TestFamily;

  beforeEach(async () => {
    family = await createTestFamily(['Nike Air Max Trainers']);
  });

  afterEach(async () => {
    await cleanupFamily(family.familyId);
  });

  it('allows a small burst and then refuses further reveals', async () => {
    expect(await consumeRevealAttempt(family.viewers.james.member.id, 2, 60)).toBe(true);
    expect(await consumeRevealAttempt(family.viewers.james.member.id, 2, 60)).toBe(true);
    expect(await consumeRevealAttempt(family.viewers.james.member.id, 2, 60)).toBe(false);
  });

  it('returns rate_limited from the reveal path once the window is full', async () => {
    for (let attempt = 0; attempt < REVEAL_LIMIT; attempt += 1) {
      expect(
        await consumeRevealAttempt(
          family.viewers.james.member.id,
          REVEAL_LIMIT,
          REVEAL_WINDOW_SECONDS,
        ),
      ).toBe(true);
    }

    const visit = await getOrCreatePickerVisit({
      buyerMemberId: family.viewers.james.member.id,
      recipient: { id: family.viewers.sarah.member.id, displayName: 'Sarah' },
      familyId: family.familyId,
    });

    if (!visit) {
      throw new Error('Expected a picker visit.');
    }

    const result = await getReveal(visit, family.eventId, 1);
    expect(result).toEqual({ ok: false, reason: 'rate_limited' });
  });

  it('counts attempts separately for each member', async () => {
    expect(await consumeRevealAttempt(family.viewers.james.member.id, 1, 60)).toBe(true);
    expect(await consumeRevealAttempt(family.viewers.james.member.id, 1, 60)).toBe(false);
    expect(await consumeRevealAttempt(family.viewers.dad.member.id, 1, 60)).toBe(true);
  });
});
