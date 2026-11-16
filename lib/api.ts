import 'server-only';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getViewerFromRequest } from '@/lib/auth';
import type { Viewer } from '@/lib/types';

/**
 * Cache revalidation is a hint, not part of the mutation. A failure here must
 * never turn a successful claim or gift save into a server error.
 */
export function revalidateViews(...paths: string[]): void {
  try {
    for (const path of paths) {
      revalidatePath(path);
    }
  } catch {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Could not revalidate cached views.');
    }
  }
}

export function noStoreJson(data: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(data, init);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export function apiError(message: string, status: number): NextResponse {
  return noStoreJson({ error: message }, { status });
}

export async function readJsonBody(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export type ApiViewerResult =
  | { ok: true; viewer: Viewer }
  | { ok: false; response: NextResponse };

export async function requireApiViewer(request: Request): Promise<ApiViewerResult> {
  const viewer = await getViewerFromRequest(request);

  if (!viewer) {
    return {
      ok: false,
      response: apiError('Your personal link is needed to do that.', 401),
    };
  }

  if (viewer.member.status !== 'active') {
    return {
      ok: false,
      response: apiError('Your place in the family is still waiting to be approved.', 403),
    };
  }

  return { ok: true, viewer };
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}
