import { redirect } from 'next/navigation';
import { loginAdmin, isAdminAuthenticated } from '@/app/actions/admin-auth';
import { GamepadIcon } from 'lucide-react';

export const metadata = {
  title: 'Admin Login · Trivia Boston',
};

export default async function AdminLoginPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const authenticated = await isAdminAuthenticated();
  if (authenticated) {
    redirect('/admin');
  }

  const searchParams = await props.searchParams;
  const error = searchParams.error;

  async function handleLogin(formData: FormData) {
    'use server';
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      redirect('/admin/login?error=Completa+todos+los+campos');
    }

    const result = await loginAdmin(username, password);

    if (!result.ok) {
      redirect(`/admin/login?error=${encodeURIComponent(result.error ?? 'Error')}`);
    }

    redirect('/admin');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f5f9] px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-sm">
          {/* Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1d3969] text-white">
              <GamepadIcon className="h-6 w-6" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-[#64748b]">
                Trivia Boston — Ingresa tus credenciales
              </p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Login form */}
          <form action={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-xs font-medium text-[#374151]"
              >
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder-[#9ca3af] outline-none focus:border-[#1d3969] focus:ring-2 focus:ring-[#1d3969]/20"
                placeholder="admin"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-medium text-[#374151]"
              >
                Contrasena
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-sm text-[#0f172a] placeholder-[#9ca3af] outline-none focus:border-[#1d3969] focus:ring-2 focus:ring-[#1d3969]/20"
                placeholder="********"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#1d3969] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#162d54] focus:outline-none focus:ring-2 focus:ring-[#1d3969]/50 focus:ring-offset-2"
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
