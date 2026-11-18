import 'server-only';
import { createHash } from 'node:crypto';
import { createAdminClient } from '@/lib/db/client';

function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const address = forwarded || request.headers.get('x-real-ip') || 'unknown';
  const salt = process.env.RATE_LIMIT_SALT ?? 'wish-and-wonder';

  return createHash('sha256').update(`${salt}:${address}`).digest('hex');
}

/**
 * A small fixed-window limit backed by Postgres. It fails open: a database
 * problem must never stop a real family from creating or joining a group.
 */
export async function allowApiRequest(
  request: Request,
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  if (process.env.NODE_ENV === 'test') {
    return true;
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('allow_api_request', {
      p_action: action,
      p_key_hash: clientKey(request),
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      return true;
    }

    return data === true;
  } catch {
    return true;
  }
}
