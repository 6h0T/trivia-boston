'use server';

import { cookies, headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sha256Hex } from '@/lib/auth/hash';

// Admin credentials. Override in production via env vars.
// The fallback hash matches the historical password — it MUST be rotated
// in any environment exposed to users by setting ADMIN_PASSWORD_HASH
// (SHA-256 hex of the new password).
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ??
  'c958feb3c8f5813d63c7fdac1816cccb3c5a7023f8f5b3e58dabe57885de0a81';

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_HOURS = 8;
const MAX_FAILED_PER_IP_15MIN = 5;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function getClientIpHash(): Promise<string> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for');
  const ip = fwd ? fwd.split(',')[0].trim() : (h.get('x-real-ip') ?? '0.0.0.0');
  return sha256Hex(ip);
}

async function logAdminAttempt(ipHash: string, success: boolean): Promise<void> {
  const supabase = createSupabaseServerClient();
  await supabase
    .from('trivia_admin_attempts')
    .insert({ ip_hash: ipHash, success });
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const ipHash = await getClientIpHash();
  const supabase = createSupabaseServerClient();

  // Rate limit per IP regardless of user existence
  const since15min = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count: failedCount } = await supabase
    .from('trivia_admin_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .eq('success', false)
    .gte('created_at', since15min);

  if ((failedCount ?? 0) >= MAX_FAILED_PER_IP_15MIN) {
    return {
      ok: false,
      error: 'Demasiados intentos fallidos. Espera 15 minutos.',
    };
  }

  // Always run the hash to keep timing roughly constant regardless of which
  // input was wrong. Comparisons are timing-safe.
  const inputHash = await sha256Hex(password ?? '');
  const usernameOk = timingSafeEqual(username ?? '', ADMIN_USERNAME);
  const passwordOk = timingSafeEqual(inputHash, ADMIN_PASSWORD_HASH);

  if (!usernameOk || !passwordOk) {
    await logAdminAttempt(ipHash, false);
    return { ok: false, error: 'Credenciales incorrectas' };
  }

  const userAgent = (await headers()).get('user-agent') ?? '';
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from('trivia_admin_sessions')
    .insert({ ip_hash: ipHash, user_agent: userAgent, expires_at: expiresAt })
    .select('id')
    .single();

  if (error || !data) {
    await logAdminAttempt(ipHash, false);
    return { ok: false, error: 'No se pudo iniciar sesión' };
  }

  await logAdminAttempt(ipHash, true);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, data.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_HOURS * 60 * 60,
  });

  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;

  if (sessionId && UUID_REGEX.test(sessionId)) {
    const supabase = createSupabaseServerClient();
    await supabase
      .from('trivia_admin_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', sessionId)
      .is('revoked_at', null);
  }

  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessionId || !UUID_REGEX.test(sessionId)) return false;

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('trivia_admin_sessions')
    .select('id, revoked_at, expires_at')
    .eq('id', sessionId)
    .maybeSingle();

  if (!data || data.revoked_at) return false;
  if (new Date(data.expires_at).getTime() < Date.now()) return false;

  await supabase
    .from('trivia_admin_sessions')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', sessionId);

  return true;
}
