import { NextResponse } from 'next/server';
import { noStoreJson, requireApiViewer } from '@/lib/api';

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await requireApiViewer(request);

  if (!auth.ok) {
    return auth.response;
  }

  return noStoreJson({
    member: {
      id: auth.viewer.member.id,
      displayName: auth.viewer.member.displayName,
      status: auth.viewer.member.status,
    },
    family: {
      id: auth.viewer.family.id,
      name: auth.viewer.family.name,
      groupType: auth.viewer.family.groupType,
      organiserMemberId: auth.viewer.family.organiserMemberId,
      requiresApproval: auth.viewer.family.requiresApproval,
    },
    event: auth.viewer.event,
  });
}
