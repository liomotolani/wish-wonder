import { afterAll, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { getViewerByToken } from '@/lib/auth';
import {
  activeSessionToken,
  addDeviceSession,
  encodeDeviceSessions,
  parseDeviceSessions,
  removeDeviceSession,
  switchActiveDeviceSession,
} from '@/lib/device-sessions';
import { cleanupFamily, createTestFamily } from './family-fixture';
import { proxy } from '@/proxy';

const createdFamilies: string[] = [];

afterAll(async () => {
  await Promise.all(createdFamilies.map((familyId) => cleanupFamily(familyId)));
});

describe('device group sessions', () => {
  it('keeps the first group when a second is added and switches data with the active group', async () => {
    const first = await createTestFamily();
    const second = await createTestFamily();
    createdFamilies.push(first.familyId, second.familyId);

    let sessions = addDeviceSession(null, first.familyId, first.tokens.mum);
    expect(Object.keys(sessions.sessions)).toEqual([first.familyId]);

    sessions = addDeviceSession(sessions, second.familyId, second.tokens.james);
    expect(Object.keys(sessions.sessions)).toEqual([first.familyId, second.familyId]);
    expect(sessions.active).toBe(second.familyId);

    const activeViewer = await getViewerByToken(activeSessionToken(sessions) ?? '');
    expect(activeViewer?.family.id).toBe(second.familyId);
    expect(activeViewer?.member.displayName).toBe('James');

    const switched = switchActiveDeviceSession(sessions, first.familyId);
    const switchedViewer = await getViewerByToken(activeSessionToken(switched) ?? '');
    expect(switchedViewer?.family.id).toBe(first.familyId);
    expect(switchedViewer?.member.displayName).toBe('Mum');

    const removed = removeDeviceSession(sessions, second.familyId);
    expect(Object.keys(removed?.sessions ?? {})).toEqual([first.familyId]);
    expect(removed?.active).toBe(first.familyId);

    const stillSignedIn = await getViewerByToken(activeSessionToken(removed) ?? '');
    expect(stillSignedIn?.family.id).toBe(first.familyId);
  });

  it('round-trips the cookie and ignores malformed groups', () => {
    const sessions = {
      active: '123e4567-e89b-12d3-a456-426614174000',
      sessions: {
        '123e4567-e89b-12d3-a456-426614174000': 'a'.repeat(43),
        'not-a-family': 'b'.repeat(43),
        '223e4567-e89b-12d3-a456-426614174000': 'too-short',
      },
    };

    const parsed = parseDeviceSessions(encodeDeviceSessions(sessions));
    expect(parsed).toEqual({
      active: '123e4567-e89b-12d3-a456-426614174000',
      sessions: { '123e4567-e89b-12d3-a456-426614174000': 'a'.repeat(43) },
    });
    expect(parseDeviceSessions('not-a-cookie')).toBeNull();
  });

  it('migrates the old single cookie into the new cookie', async () => {
    const family = await createTestFamily();
    createdFamilies.push(family.familyId);

    const response = await proxy(
      new NextRequest('http://localhost/family', {
        headers: { cookie: `ww_member=${family.tokens.mum}` },
      }),
    );

    const cookieValue = response.cookies.get('ww_groups')?.value;
    const sessions = parseDeviceSessions(cookieValue);

    expect(sessions?.active).toBe(family.familyId);
    expect(sessions?.sessions[family.familyId]).toBe(family.tokens.mum);
    expect(response.cookies.get('ww_member')?.value).toBe('');
  });
});
