import { NextResponse } from 'next/server';
import {
  apiError,
  noStoreJson,
  requireApiViewer,
  revalidateViews,
} from '@/lib/api';
import {
  createNextEventRecord,
  getNextEventName,
} from '@/lib/db/organiser';

export async function POST(request: Request): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  if (auth.viewer.family.organiserMemberId !== auth.viewer.member.id) {
    return apiError('Only the organiser can start a new event.', 403);
  }

  try {
    const eventName = await getNextEventName(auth.viewer.family.id);
    const created = await createNextEventRecord(
      auth.viewer.family.id,
      auth.viewer.member.id,
      eventName,
    );

    revalidateViews('/settings', '/family', '/wishlist');
    return noStoreJson({ ok: true, eventName: created.eventName }, { status: 201 });
  } catch {
    console.error('Could not create next event.');
    return apiError('We could not start the next event just now. Please try again.', 500);
  }
}
