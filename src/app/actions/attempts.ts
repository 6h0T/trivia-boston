'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireActiveSession } from '@/lib/auth/auth-session';
import {
  setAttemptToken,
  verifyAttemptTiming,
  clearAttemptToken,
} from '@/lib/auth/attempt-timing';
import { getWeekServer } from '@/data/questions-server';
import { isWeekAvailable } from '@/data/questions';
import type { PublicQuestion } from '@/types/game';

export type StartAttemptResult =
  | {
      ok: true;
      attemptId: string;
      weekNumber: number;
      weekTitle: string;
      weekDescription?: string;
      questions: PublicQuestion[];
      startedAtMs: number;
    }
  | { ok: false; error: 'session_expired' | 'week_not_available' | 'daily_limit_reached' };

export type SubmitAnswer = { questionId: string; selectedIndex: number | null };

export type SubmitErrorCode =
  | 'session_expired'
  | 'invalid_attempt'
  | 'already_submitted'
  | 'daily_limit_reached'
  | 'save_failed';

export type SubmitAttemptResult =
  | {
      ok: true;
      score: number;
      totalTimeMs: number;
      results: { questionId: string; selectedIndex: number | null; isCorrect: boolean }[];
      attemptsRemaining: number;
    }
  | { ok: false; error: SubmitErrorCode };

export async function startAttempt(weekNumber: number): Promise<StartAttemptResult> {
  const session = await requireActiveSession();
  if (!session.ok) return { ok: false, error: 'session_expired' };
  if (!isWeekAvailable(weekNumber)) return { ok: false, error: 'week_not_available' };

  const week = getWeekServer(weekNumber);
  if (!week) return { ok: false, error: 'week_not_available' };

  const questionsForRpc = week.questions.map((q) => ({
    id: q.id,
    correctIndex: q.correctIndex,
  }));
  const publicQuestions: PublicQuestion[] = week.questions.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    category: q.category,
  }));

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc('start_trivia_attempt', {
    p_session_id: session.sessionId,
    p_week_number: weekNumber,
    p_questions: questionsForRpc,
  });

  if (error || !data) return { ok: false, error: 'session_expired' };
  const payload = data as Record<string, unknown>;
  if (payload.ok !== true) {
    const err = (payload.error as string) ?? 'session_expired';
    if (err === 'daily_limit_reached' || err === 'session_expired') {
      return { ok: false, error: err };
    }
    return { ok: false, error: 'session_expired' };
  }

  const attemptId = payload.attempt_id as string;
  const startedAtMs = Number(payload.started_at_ms);
  await setAttemptToken(attemptId, startedAtMs);

  return {
    ok: true,
    attemptId,
    weekNumber: week.weekNumber,
    weekTitle: week.title,
    weekDescription: week.description,
    questions: publicQuestions,
    startedAtMs,
  };
}

export async function submitAttempt(
  attemptId: string,
  answers: SubmitAnswer[]
): Promise<SubmitAttemptResult> {
  const session = await requireActiveSession();
  if (!session.ok) return { ok: false, error: 'session_expired' };

  // Anti-tampering: rechazar submits que llegan demasiado rápido (script bypass).
  // El token firmado HMAC se setea en startAttempt y captura started_at server-side.
  const timing = await verifyAttemptTiming(attemptId);
  if (!timing.ok) {
    return { ok: false, error: 'invalid_attempt' };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc('submit_trivia_attempt', {
    p_session_id: session.sessionId,
    p_attempt_id: attemptId,
    p_answers: answers,
  });

  if (error || !data) return { ok: false, error: 'save_failed' };
  const payload = data as Record<string, unknown>;
  if (payload.ok !== true) {
    const err = (payload.error as string) ?? 'save_failed';
    const known: SubmitErrorCode[] = [
      'session_expired',
      'invalid_attempt',
      'already_submitted',
      'daily_limit_reached',
    ];
    if ((known as string[]).includes(err)) {
      return { ok: false, error: err as SubmitErrorCode };
    }
    return { ok: false, error: 'save_failed' };
  }

  await clearAttemptToken();

  return {
    ok: true,
    score: Number(payload.score),
    totalTimeMs: Number(payload.total_time_ms),
    results:
      (payload.results as Array<{
        questionId: string;
        selectedIndex: number | null;
        isCorrect: boolean;
      }>) ?? [],
    attemptsRemaining: Number(payload.attempts_remaining),
  };
}
