import 'server-only';
import { createAdminClient } from '@/lib/db/client';

/** Delete this device's session row for one group. Other devices keep theirs. */
export async function deleteMemberSessionByTokenHash(tokenHash: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('member_sessions')
    .delete()
    .eq('token_hash', tokenHash);

  if (error) {
    throw error;
  }
}
