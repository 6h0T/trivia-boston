-- 2026-04-15: Admin auth hardening
-- Replaces the previous "any 64-char cookie wins" admin auth with real
-- DB-backed sessions and per-IP rate limiting on the admin login.

CREATE TABLE IF NOT EXISTS public.trivia_admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS trivia_admin_sessions_id_active_idx
  ON public.trivia_admin_sessions (id)
  WHERE revoked_at IS NULL;

ALTER TABLE public.trivia_admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.trivia_admin_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trivia_admin_attempts_ip_time_idx
  ON public.trivia_admin_attempts (ip_hash, created_at DESC);

ALTER TABLE public.trivia_admin_attempts ENABLE ROW LEVEL SECURITY;
