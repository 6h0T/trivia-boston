'use server';

import { cookies } from 'next/headers';

// Pre-computed SHA-256 hash of the admin password (never store plaintext)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD_HASH =
  'c958feb3c8f5813d63c7fdac1816cccb3c5a7023f8f5b3e58dabe57885de0a81';

// Salt for session token generation
const SESSION_SALT = 'trivia-boston-admin-2026';

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  // Validate username
  if (username !== ADMIN_USERNAME) {
    return { ok: false, error: 'Credenciales incorrectas' };
  }

  // Hash the provided password and compare with stored hash
  const inputHash = await sha256Hex(password);
  if (inputHash !== ADMIN_PASSWORD_HASH) {
    return { ok: false, error: 'Credenciales incorrectas' };
  }

  // Generate a session token
  const uuid = crypto.randomUUID();
  const token = await sha256Hex(uuid + SESSION_SALT);

  // Set httpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  // Valid if the cookie exists and has a non-empty hex token (64 chars for SHA-256)
  return !!session?.value && session.value.length === 64;
}
