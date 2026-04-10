import { createServerClient } from '@supabase/ssr';

/**
 * Server-side Supabase client for server actions.
 * Uses the publishable key — custom auth flow stores sessions
 * in localStorage on the client, no Supabase Auth session cookies.
 */
export function createSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          /* no-op: we don't use Supabase Auth cookies */
        },
      },
    }
  );
}
