'use server';

import { redirect } from 'next/navigation';
import {
  verifyCredentials,
  createDocsSession,
  destroyDocsSession,
} from '@/lib/docs/auth';

export async function loginDocsAction(formData: FormData) {
  const u = String(formData.get('username') ?? '');
  const p = String(formData.get('password') ?? '');

  if (!u || !p) {
    redirect('/docs?error=' + encodeURIComponent('Completa+todos+los+campos'));
  }

  const ok = await verifyCredentials(u, p);
  if (!ok) {
    redirect('/docs?error=' + encodeURIComponent('Credenciales+invalidas'));
  }

  await createDocsSession();
  redirect('/docs');
}

export async function logoutDocsAction() {
  await destroyDocsSession();
  redirect('/docs');
}
