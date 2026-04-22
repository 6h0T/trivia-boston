'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireActiveSession } from '@/lib/auth/auth-session';

export async function getDailyAttempts(): Promise<{
  used: number;
  remaining: number;
  limit: number;
}> {
  const session = await requireActiveSession();
  if (!session.ok) return { used: 0, remaining: 3, limit: 3 };

  const supabase = createSupabaseServerClient();
  const { data } = await supabase.rpc('get_daily_trivia_attempts', {
    p_session_id: session.sessionId,
  });
  if (!data || typeof data !== 'object') {
    return { used: 0, remaining: 3, limit: 3 };
  }
  const p = data as Record<string, unknown>;
  return {
    used: Number(p.used ?? 0),
    remaining: Number(p.remaining ?? 3),
    limit: Number(p.limit ?? 3),
  };
}
