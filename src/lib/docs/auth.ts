import { cookies } from 'next/headers';
import { createHash, createHmac, timingSafeEqual } from 'crypto';

const K1 = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';
const K2 = '3d1c26b3e8c9b69200370ce00c80a81559f75e3a2ffd187acc24c0717a935724';
const K3 = 'a7f3c2e9d4b1685f7a2c83d95e6417b82fc4a6d938e7052c193fb4068adce521';

const COOKIE = 'dx_session';
const MAX_AGE = 60 * 60 * 8;

function sha(v: string) {
  return createHash('sha256').update(v).digest('hex');
}

function eqConst(a: string, b: string) {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  if (A.length !== B.length) return false;
  return timingSafeEqual(A, B);
}

function sign(payload: string) {
  return createHmac('sha256', K3).update(payload).digest('hex');
}

function buildToken(exp: number) {
  const payload = `${exp}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, mac] = token.split('.');
  if (!payload || !mac) return false;
  const expected = sign(payload);
  if (!eqConst(mac, expected)) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() / 1000 > exp) return false;
  return true;
}

export async function verifyCredentials(u: string, p: string): Promise<boolean> {
  const okU = eqConst(sha(u ?? ''), K1);
  const okP = eqConst(sha(p ?? ''), K2);
  return okU && okP;
}

export async function isDocsAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE)?.value);
}

export async function createDocsSession(): Promise<void> {
  const store = await cookies();
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  store.set(COOKIE, buildToken(exp), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroyDocsSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
