import { afterAll, describe, expect, it } from 'vitest';
import { POST as createFamilyRoute } from '@/app/api/families/route';
import { GET as meRoute } from '@/app/api/me/route';
import { POST as claimRoute } from '@/app/api/claims/route';
import { POST as deviceLinkRoute } from '@/app/api/me/device-link/route';
import { POST as giftPhotoRoute } from '@/app/api/gift-photos/route';
import { POST as reissueLinkRoute } from '@/app/api/organiser/members/[id]/reissue-link/route';
import { GET as useDeviceLinkRoute } from '@/app/device/[token]/route';
import { createAdminClient } from '@/lib/db/client';
import { parseDeviceSessions } from '@/lib/device-sessions';
import {
  getOrCreatePickerVisit,
  getReveal,
} from '@/lib/db/picker';
import {
  cleanupFamily,
  createTestFamily,
} from './family-fixture';

const createdFamilyNames: string[] = [];

afterAll(async () => {
  const supabase = createAdminClient();

  for (const name of createdFamilyNames) {
    const { data } = await supabase.from('families').select('id').eq('name', name);
    for (const family of data ?? []) {
      await cleanupFamily(family.id);
    }
  }
});

describe('HTTP endpoints', () => {
  it('rejects an unknown group type before creating anything', async () => {
    const response = await createFamilyRoute(
      new Request('http://localhost/api/families', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          familyName: 'Should Not Exist',
          groupType: 'team',
          memberName: 'Mum',
          requiresApproval: false,
        }),
      }),
    );

    expect(response.status).toBe(400);
    const { data } = await createAdminClient()
      .from('families')
      .select('id')
      .eq('name', 'Should Not Exist');
    expect(data).toHaveLength(0);
  });

  it('sends an existing device straight to the dashboard when starting another group', async () => {
    const firstName = `First Group ${crypto.randomUUID().slice(0, 8)}`;
    const secondName = `Second Group ${crypto.randomUUID().slice(0, 8)}`;
    createdFamilyNames.push(firstName, secondName);

    const first = await createFamilyRoute(
      new Request('http://localhost/api/families', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          familyName: firstName,
          memberName: 'Mum',
          requiresApproval: false,
        }),
      }),
    );
    const firstCookie = first.headers.get('set-cookie') ?? '';
    const deviceCookie = firstCookie.match(/ww_groups=([^;]+)/)?.[1];
    expect(deviceCookie).toBeTruthy();

    const second = await createFamilyRoute(
      new Request('http://localhost/api/families', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: `ww_groups=${deviceCookie}`,
        },
        body: JSON.stringify({
          familyName: secondName,
          memberName: 'Mum',
          requiresApproval: false,
        }),
      }),
    );

    expect(second.status).toBe(201);
    const data = (await second.json()) as { next: string };
    expect(data.next).toBe('/family');

    const secondCookie = second.headers.get('set-cookie') ?? '';
    const nextDeviceCookie = secondCookie.match(/ww_groups=([^;]+)/)?.[1];
    const sessions = parseDeviceSessions(nextDeviceCookie);
    expect(Object.keys(sessions?.sessions ?? {})).toHaveLength(2);
  });

  it('creates a family, sets an httpOnly cookie and returns only safe member data', async () => {
    const familyName = `API Family ${crypto.randomUUID().slice(0, 8)}`;
    createdFamilyNames.push(familyName);

    const response = await createFamilyRoute(
      new Request('http://localhost/api/families', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          familyName,
          memberName: 'Mum',
          requiresApproval: false,
        }),
      }),
    );

    expect(response.status).toBe(201);
    const data = (await response.json()) as {
      personalLink: string;
      inviteLink: string;
      next: string;
      memberName: string;
    };
    expect(data.memberName).toBe('Mum');
    expect(data.personalLink).toMatch(/\/me\/[A-Za-z0-9_-]{43}$/);
    expect(data.inviteLink).toMatch(/\/join\/[a-f0-9]{16}$/);
    expect(data.next).toBe('/group-link?created=1');

    const cookie = response.headers.get('set-cookie') ?? '';
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=lax');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('ww_welcome=1');

    const token = data.personalLink.split('/').pop();
    expect(token).toBeTruthy();

    if (!token) {
      return;
    }

    const meResponse = await meRoute(
      new Request('http://localhost/api/me', {
        headers: { cookie: `ww_member=${token}` },
      }),
    );
    expect(meResponse.status).toBe(200);
    const me = (await meResponse.json()) as {
      member: { displayName: string };
      family: { name: string };
    };
    expect(me.member.displayName).toBe('Mum');
    expect(me.family.name).toBe(familyName);
    expect(JSON.stringify(me)).not.toContain('token');
    expect(JSON.stringify(me)).not.toContain('claim');
  });

  it('returns one success and one Already picked from two simultaneous claim requests', async () => {
    const family = await createTestFamily(['Nike Air Max Trainers']);

    try {
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

      const callClaim = (token: string, visitId: string) =>
        claimRoute(
          new Request('http://localhost/api/claims', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              cookie: `ww_member=${token}`,
            },
            body: JSON.stringify({ visitId, number: 1 }),
          }),
        );

      const [jamesResponse, dadResponse] = await Promise.all([
        callClaim(family.tokens.james, jamesVisit.id),
        callClaim(family.tokens.dad, dadVisit.id),
      ]);

      const statuses = [jamesResponse.status, dadResponse.status].sort();
      expect(statuses).toEqual([200, 409]);

      const bodies = await Promise.all([jamesResponse.json(), dadResponse.json()]);
      const success = bodies.find((body) => body.ok === true);
      const failure = bodies.find((body) => body.ok === false);

      expect(success).toBeTruthy();
      expect(failure).toEqual({ ok: false, reason: 'already_picked' });
      expect(JSON.stringify(bodies)).not.toContain('Nike Air Max');
      expect(JSON.stringify(bodies)).not.toContain('Sarah');
    } finally {
      await cleanupFamily(family.familyId);
    }
  });

  it('creates a one-time device link and signs the second device in without a claim leak', async () => {
    const family = await createTestFamily();

    try {
      const response = await deviceLinkRoute(
        new Request('http://localhost/api/me/device-link', {
          method: 'POST',
          headers: { cookie: `ww_member=${family.tokens.james}` },
        }),
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        url: string;
        expiresAt: string;
        qrSvg: string;
      };
      expect(data.url).toMatch(/\/device\/[A-Za-z0-9_-]{43}$/);
      expect(data.expiresAt).toBeTruthy();
      expect(data.qrSvg).toContain('<svg');
      expect(JSON.stringify(data)).not.toContain('claim');

      const deviceToken = data.url.split('/').pop();
      expect(deviceToken).toBeTruthy();
      if (!deviceToken) {
        return;
      }

      const supabase = createAdminClient();
      const { data: rawRows } = await supabase
        .from('device_links')
        .select('id')
        .eq('token_hash', deviceToken);
      expect(rawRows).toHaveLength(0);

      const useResponse = await useDeviceLinkRoute(
        new Request(`http://localhost/device/${deviceToken}`),
        { params: Promise.resolve({ token: deviceToken }) },
      );
      expect(useResponse.status).toBe(307);
      expect(useResponse.headers.get('location')).toContain('/family');

      const cookie = useResponse.headers.get('set-cookie') ?? '';
      expect(cookie).toContain('HttpOnly');
      const cookieValue = cookie.match(/ww_groups=([^;]+)/)?.[1];
      expect(cookieValue).toBeTruthy();

      if (!cookieValue) {
        return;
      }

      const sessions = parseDeviceSessions(cookieValue);
      expect(sessions?.active).toBe(family.familyId);
      expect(sessions?.sessions[family.familyId]).toBeTruthy();

      const meResponse = await meRoute(
        new Request('http://localhost/api/me', {
          headers: { cookie: `ww_groups=${cookieValue}` },
        }),
      );
      expect(meResponse.status).toBe(200);
      expect(((await meResponse.json()) as { member: { displayName: string } }).member.displayName).toBe(
        'James',
      );

      const reused = await useDeviceLinkRoute(
        new Request(`http://localhost/device/${deviceToken}`),
        { params: Promise.resolve({ token: deviceToken }) },
      );
      expect(reused.status).toBe(307);
      expect(reused.headers.get('location')).toContain('/link-expired');
    } finally {
      await cleanupFamily(family.familyId);
    }
  });

  it('lets only the organiser replace a personal link and returns it once', async () => {
    const family = await createTestFamily();

    try {
      const forbidden = await reissueLinkRoute(
        new Request(
          `http://localhost/api/organiser/members/${family.viewers.sarah.member.id}/reissue-link`,
          {
            method: 'POST',
            headers: { cookie: `ww_member=${family.tokens.dad}` },
          },
        ),
        { params: Promise.resolve({ id: family.viewers.sarah.member.id }) },
      );
      expect(forbidden.status).toBe(403);

      const response = await reissueLinkRoute(
        new Request(
          `http://localhost/api/organiser/members/${family.viewers.sarah.member.id}/reissue-link`,
          {
            method: 'POST',
            headers: { cookie: `ww_member=${family.tokens.mum}` },
          },
        ),
        { params: Promise.resolve({ id: family.viewers.sarah.member.id }) },
      );
      expect(response.status).toBe(200);
      const data = (await response.json()) as { personalLink: string };
      expect(data.personalLink).toMatch(/\/me\/[A-Za-z0-9_-]{43}$/);
      expect(JSON.stringify(data)).not.toContain('claim');

      const oldSession = await meRoute(
        new Request('http://localhost/api/me', {
          headers: { cookie: `ww_member=${family.tokens.sarah}` },
        }),
      );
      expect(oldSession.status).toBe(401);

      const newToken = data.personalLink.split('/').pop();
      expect(newToken).toBeTruthy();
      if (!newToken) {
        return;
      }

      const newSession = await meRoute(
        new Request('http://localhost/api/me', {
          headers: { cookie: `ww_member=${newToken}` },
        }),
      );
      expect(newSession.status).toBe(200);
      expect(
        ((await newSession.json()) as { member: { displayName: string } }).member.displayName,
      ).toBe('Sarah');
    } finally {
      await cleanupFamily(family.familyId);
    }
  });

  it(
    'uploads an allowed gift photo and rejects other files',
    async () => {
      const family = await createTestFamily();

      try {
        const invalidForm = new FormData();
        invalidForm.append('file', new File(['hello'], 'note.txt', { type: 'text/plain' }));
        const invalidResponse = await giftPhotoRoute(
          new Request('http://localhost/api/gift-photos', {
            method: 'POST',
            headers: { cookie: `ww_member=${family.tokens.james}` },
            body: invalidForm,
          }),
        );
        expect(invalidResponse.status).toBe(400);

        const png = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          'base64',
        );
        const form = new FormData();
        form.append('file', new File([png], 'test.png', { type: 'image/png' }));

        const response = await giftPhotoRoute(
          new Request('http://localhost/api/gift-photos', {
            method: 'POST',
            headers: { cookie: `ww_member=${family.tokens.james}` },
            body: form,
          }),
        );
        expect(response.status).toBe(201);
        const data = (await response.json()) as { ok: boolean; url: string };
        expect(data.ok).toBe(true);
        expect(data.url).toContain('/storage/v1/object/public/gift-photos/');

        const path = data.url.split('/gift-photos/')[1];
        expect(path).toBeTruthy();
        if (path) {
          const supabase = createAdminClient();
          await supabase.storage.from('gift-photos').remove([path]);
        }
      } finally {
        await cleanupFamily(family.familyId);
      }
    },
    30_000,
  );
});
