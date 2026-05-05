import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'trivia_attempt_token';
const COOKIE_MAX_AGE = 60 * 60; // 1 hour — well above the time to play

// 3 preguntas × 3000ms mínimo realista de lectura+respuesta humana = 9s.
// Submits por debajo de este umbral se consideran automatizados.
export const MIN_ATTEMPT_ELAPSED_MS = 9000;

function getSecret(): string {
  const secret = process.env.TRIVIA_ATTEMPT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'TRIVIA_ATTEMPT_SECRET must be set to a random ≥32-char value in env'
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex');
}

function verify(payload: string, signature: string): boolean {
  const expected = sign(payload);
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function setAttemptToken(attemptId: string, startedAtMs: number): Promise<void> {
  const payload = `${attemptId}.${startedAtMs}`;
  const token = `${payload}.${sign(payload)}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

export type TimingCheck =
  | { ok: true; elapsedMs: number }
  | { ok: false; reason: 'missing_token' | 'invalid_signature' | 'mismatched_attempt' | 'too_fast' };

export async function verifyAttemptTiming(attemptId: string): Promise<TimingCheck> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return { ok: false, reason: 'missing_token' };

  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'invalid_signature' };
  const [tokenAttemptId, startedAtStr, signature] = parts;
  const payload = `${tokenAttemptId}.${startedAtStr}`;
  if (!verify(payload, signature)) return { ok: false, reason: 'invalid_signature' };
  if (tokenAttemptId !== attemptId) return { ok: false, reason: 'mismatched_attempt' };

  const startedAtMs = Number(startedAtStr);
  const elapsedMs = Date.now() - startedAtMs;
  if (elapsedMs < MIN_ATTEMPT_ELAPSED_MS) {
    return { ok: false, reason: 'too_fast' };
  }
  return { ok: true, elapsedMs };
}

export async function clearAttemptToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
