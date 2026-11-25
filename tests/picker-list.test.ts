import { describe, expect, it } from 'vitest';
import { GET as gridRoute } from '@/app/api/picker/[memberId]/route';
import { GET as listRoute } from '@/app/api/picker/[memberId]/list/route';
import { POST as revealRoute } from '@/app/api/picker/reveal/route';
import { POST as claimRoute } from '@/app/api/claims/route';
import { createAdminClient } from '@/lib/db/client';
import { createGiftRecord } from '@/lib/db/gifts';
import { getOrCreatePickerVisit } from '@/lib/db/picker';
import { cleanupFamily, createTestFamily, sampleGift } from './family-fixture';

function cookie(token: string): string {
  return `ww_member=${token}`;
}

async function gridFor(
  memberId: string,
  token: string,
  visitId?: string,
): Promise<Response> {
  const query = visitId ? `?visit=${visitId}` : '';
  return gridRoute(
    new Request(`http://localhost/api/picker/${memberId}${query}`, {
      headers: { cookie: cookie(token) },
    }),
    { params: Promise.resolve({ memberId }) },
  );
}

async function listFor(memberId: string, token: string): Promise<Response> {
  return listRoute(
    new Request(`http://localhost/api/picker/${memberId}/list`, {
      headers: { cookie: cookie(token) },
    }),
    { params: Promise.resolve({ memberId }) },
  );
}

async function claimByGift(giftId: string, token: string): Promise<Response> {
  return claimRoute(
    new Request('http://localhost/api/claims', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: cookie(token),
      },
      body: JSON.stringify({ giftId }),
    }),
  );
}

describe('picker boxes and list', () => {
  it('returns prices without gift ids or names, and Taken boxes carry only number and taken', async () => {
    const family = await createTestFamily();

    try {
      const sarahId = family.viewers.sarah.member.id;
      const pricedGift = await createGiftRecord(
        family.eventId,
        sarahId,
        sampleGift({ name: 'Priced gift', currency: 'AUD', pricePence: 1250 }),
      );
      const unpricedGift = await createGiftRecord(
        family.eventId,
        sarahId,
        sampleGift({ name: 'No price gift', pricePence: null }),
      );
      const takenGift = await createGiftRecord(
        family.eventId,
        sarahId,
        sampleGift({ name: 'Taken gift', pricePence: 4000 }),
      );

      const claim = await claimByGift(takenGift, family.tokens.dad);
      expect(claim.status).toBe(200);

      const visit = await getOrCreatePickerVisit({
        buyerMemberId: family.viewers.james.member.id,
        recipient: { id: sarahId, displayName: 'Sarah' },
        familyId: family.familyId,
      });

      if (!visit) {
        throw new Error('Expected a visit.');
      }

      const response = await gridFor(sarahId, family.tokens.james, visit.id);
      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        boxes: Array<Record<string, unknown>>;
      };

      expect(data.boxes).toHaveLength(3);

      const takenBox = data.boxes.find((box) => box.taken === true);
      expect(takenBox).toEqual({ number: expect.any(Number), taken: true });

      const pricedBox = data.boxes.find((box) => box.pricePence === 1250);
      expect(pricedBox).toMatchObject({ pricePence: 1250, currency: 'AUD' });

      const unpricedBox = data.boxes.find((box) => box.pricePence === null);
      expect(unpricedBox).toBeTruthy();

      const serialised = JSON.stringify(data);
      for (const giftId of [pricedGift, unpricedGift, takenGift]) {
        expect(serialised).not.toContain(giftId);
      }
      expect(serialised).not.toContain('Priced gift');
      expect(serialised).not.toContain('Taken gift');
      expect(serialised).not.toContain('claim');
    } finally {
      await cleanupFamily(family.familyId);
    }
  });

  it('refuses the recipient and never returns buyer or claim details in list view', async () => {
    const family = await createTestFamily();
    const sarahId = family.viewers.sarah.member.id;

    try {
      const availableGift = await createGiftRecord(
        family.eventId,
        sarahId,
        sampleGift({
          name: 'Available gift',
          pricePence: 1800,
          shopUrl: 'https://www.waterstones.com/book',
        }),
      );
      const noPriceGift = await createGiftRecord(
        family.eventId,
        sarahId,
        sampleGift({ name: 'No price gift', pricePence: null }),
      );
      const takenGift = await createGiftRecord(
        family.eventId,
        sarahId,
        sampleGift({ name: 'Taken gift', pricePence: 2500 }),
      );

      const claimed = await claimByGift(takenGift, family.tokens.dad);
      expect(claimed.status).toBe(200);

      const ownList = await listFor(sarahId, family.tokens.sarah);
      expect(ownList.status).toBe(403);

      const response = await listFor(sarahId, family.tokens.james);
      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        items: Array<Record<string, unknown>>;
        availableCount: number;
        totalCount: number;
      };

      expect(data.totalCount).toBe(3);
      expect(data.availableCount).toBe(2);
      expect(data.items.map((item) => item.name)).toEqual([
        'Available gift',
        'Taken gift',
        'No price gift',
      ]);
      expect(Object.keys(data.items[0]).sort()).toEqual([
        'currency',
        'id',
        'imageUrl',
        'name',
        'pricePence',
        'priority',
        'shopName',
        'shopUrl',
        'taken',
      ]);
      expect(data.items[0]).toMatchObject({
        id: availableGift,
        shopName: 'Waterstones',
        shopUrl: 'https://www.waterstones.com/book',
        taken: false,
      });
      expect(data.items[1]).toMatchObject({ id: takenGift, taken: true });
      expect(data.items[2]).toMatchObject({ id: noPriceGift, pricePence: null, taken: false });

      const serialised = JSON.stringify(data);
      expect(serialised).not.toContain(family.viewers.dad.member.id);
      expect(serialised).not.toContain('claimer');
      expect(serialised).not.toContain('gift_snapshot');
      expect(serialised).not.toContain('"claim"');
    } finally {
      await cleanupFamily(family.familyId);
    }
  });

  it('refuses boxes and reveals when mystery boxes are off, but list and claiming work', async () => {
    const family = await createTestFamily(['Mystery off gift']);
    const sarahId = family.viewers.sarah.member.id;
    const giftId = family.giftIds[0];

    try {
      const visit = await getOrCreatePickerVisit({
        buyerMemberId: family.viewers.james.member.id,
        recipient: { id: sarahId, displayName: 'Sarah' },
        familyId: family.familyId,
      });

      if (!visit) {
        throw new Error('Expected a visit.');
      }

      const supabase = createAdminClient();
      const { error } = await supabase
        .from('families')
        .update({ mystery_boxes: false })
        .eq('id', family.familyId);

      if (error) {
        throw error;
      }

      const grid = await gridFor(sarahId, family.tokens.james, visit.id);
      expect(grid.status).toBe(403);
      expect(JSON.stringify(await grid.json())).not.toContain('Mystery off gift');

      const reveal = await revealRoute(
        new Request('http://localhost/api/picker/reveal', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: cookie(family.tokens.james),
          },
          body: JSON.stringify({ visitId: visit.id, number: 1 }),
        }),
      );
      expect(reveal.status).toBe(403);

      const list = await listFor(sarahId, family.tokens.james);
      expect(list.status).toBe(200);
      expect(JSON.stringify(await list.json())).toContain('Mystery off gift');

      const claim = await claimByGift(giftId, family.tokens.james);
      expect(claim.status).toBe(200);
    } finally {
      await cleanupFamily(family.familyId);
    }
  });

  it('claims from the list and gives one success and one Already picked when two claim at once', async () => {
    const family = await createTestFamily(['Simultaneous gift']);
    const giftId = family.giftIds[0];

    try {
      const [first, second] = await Promise.all([
        claimByGift(giftId, family.tokens.james),
        claimByGift(giftId, family.tokens.dad),
      ]);

      expect([first.status, second.status].sort()).toEqual([200, 409]);
      const bodies = await Promise.all([first.json(), second.json()]);
      expect(bodies.some((body) => body.ok === true)).toBe(true);
      expect(bodies.some((body) => body.reason === 'already_picked')).toBe(true);
      expect(JSON.stringify(bodies)).not.toContain('Simultaneous gift');
      expect(JSON.stringify(bodies)).not.toContain('James');
      expect(JSON.stringify(bodies)).not.toContain('Dad');
    } finally {
      await cleanupFamily(family.familyId);
    }
  });
});
