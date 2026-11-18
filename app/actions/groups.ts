'use server';

import { redirect } from 'next/navigation';
import { getViewerByToken } from '@/lib/auth';
import { deleteMemberSessionByTokenHash } from '@/lib/db/sessions';
import {
  removeDeviceSession,
  switchActiveDeviceSession,
} from '@/lib/device-sessions';
import {
  readDeviceSessions,
  writeDeviceSessionsToCookieJar,
} from '@/lib/device-sessions.server';
import { hashPersonalToken } from '@/lib/tokens';

export async function switchGroupAction(familyId: string): Promise<void> {
  const current = await readDeviceSessions();
  const next = switchActiveDeviceSession(current, familyId);

  if (!next) {
    redirect('/');
  }

  await writeDeviceSessionsToCookieJar(next);
  redirect('/family');
}

export async function removeGroupAction(familyId: string): Promise<void> {
  const current = await readDeviceSessions();
  const token = current?.sessions[familyId];

  if (!current || !token) {
    redirect('/');
  }

  try {
    const viewer = await getViewerByToken(token);

    if (viewer?.family.id === familyId) {
      await deleteMemberSessionByTokenHash(hashPersonalToken(token));
    }
  } catch {
    console.error('Could not delete the group session.');
  }

  const next = removeDeviceSession(current, familyId);
  await writeDeviceSessionsToCookieJar(next);
  redirect(next ? '/family' : '/');
}
