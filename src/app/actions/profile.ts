'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface UserPublicProfile {
  userId: string;
  name: string;
  gamesPlayed: number;
  bestScore: number;
  bestTimeMs: number | null;
  avgTimeMs: number | null;
  joinedAt: string;
}

export async function getUserPublicProfile(
  userId: string,
  weekNumber: number
): Promise<UserPublicProfile | null> {
  const supabase = createSupabaseServerClient();

  // Fetch user name + created_at
  const { data: user } = await supabase
    .from('trivia_users')
    .select('id, name, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (!user) return null;

  // Fetch all sessions for this week
  const { data: sessions } = await supabase
    .from('trivia_sessions')
    .select('score, total_time_ms')
    .eq('user_id', userId)
    .eq('week_number', weekNumber)
    .order('score', { ascending: false })
    .order('total_time_ms', { ascending: true });

  const gamesPlayed = sessions?.length ?? 0;
  const bestScore = sessions?.[0]?.score ?? 0;
  const bestTimeMs = sessions?.[0]?.total_time_ms ?? null;
  const avgTimeMs =
    gamesPlayed > 0
      ? Math.round(
          sessions!.reduce((sum, s) => sum + s.total_time_ms, 0) / gamesPlayed
        )
      : null;

  return {
    userId: user.id,
    name: user.name,
    gamesPlayed,
    bestScore,
    bestTimeMs,
    avgTimeMs,
    joinedAt: user.created_at,
  };
}
