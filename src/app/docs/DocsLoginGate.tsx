'use client';

import { useSearchParams } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';
import { loginDocsAction } from '@/app/actions/docs-auth';

export default function DocsLoginGate() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-surface px-4 py-12 text-on-surface">
      <div className="w-full max-w-sm">
        <div className="glass-card rounded-2xl border border-outline-variant/20 bg-surface-container/60 p-8 shadow-lg">
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h1 className="font-headline text-lg font-bold tracking-tight">
                Documentación restringida
              </h1>
              <p className="mt-1 text-xs text-outline">
                Ingresá tus credenciales para continuar
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <form action={loginDocsAction} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-outline"
              >
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-outline"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-variant/30 px-3 py-2 text-sm outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface"
            >
              Ingresar
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] font-semibold tracking-wider text-black">
          BOSTON ASSET MANAGER SA
        </p>
      </div>
    </main>
  );
}
