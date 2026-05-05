-- 2026-05-05: Auditoría Tamara Kukiolka
-- Sospecha: completó las semanas 1 y 2 en ~8081ms (físicamente imposible con
-- 3 preguntas × 15s). Investigar manipulación del flujo start→submit.
--
-- Ejecutar en Supabase SQL Editor (proyecto ewhucijcniibgxqwbhte).

-- 1) Identificar al usuario
SELECT id, name, email, phone, created_at
FROM trivia_users
WHERE LOWER(name) LIKE '%tamara%'
   OR LOWER(name) LIKE '%kukiolka%'
   OR LOWER(email) LIKE '%tamara%'
   OR LOWER(email) LIKE '%kukiolka%';

-- 2) Revisar sus sesiones completadas (las 2 semanas)
SELECT s.week_number, s.score, s.total_time_ms, s.completed_at
FROM trivia_sessions s
JOIN trivia_users u ON u.id = s.user_id
WHERE LOWER(u.name) LIKE '%tamara%' OR LOWER(u.name) LIKE '%kukiolka%'
ORDER BY s.week_number, s.completed_at;

-- 3) Posición que tendría en el leaderboard de cada semana
SELECT week_number, name, score, total_time_ms,
       RANK() OVER (PARTITION BY week_number ORDER BY score DESC, total_time_ms ASC) AS rank
FROM trivia_leaderboard
WHERE week_number IN (1, 2)
ORDER BY week_number, rank;

-- 4) Detección masiva: cualquier sesión con tiempo sospechoso (<9s)
--    9000ms = 3 preguntas × 3s mínimo realista de lectura+respuesta humana.
SELECT u.name, u.email, s.week_number, s.score, s.total_time_ms, s.completed_at
FROM trivia_sessions s
JOIN trivia_users u ON u.id = s.user_id
WHERE s.total_time_ms < 9000
ORDER BY s.total_time_ms ASC;

-- 5) Si se confirma manipulación, invalidar (no borrar — auditoría):
--    Cambiar score a 0 para sacarlas del leaderboard, dejando registro forense.
-- UPDATE trivia_sessions
-- SET score = 0,
--     total_time_ms = 999999,
--     completed_at = completed_at  -- preservar timestamp original
-- WHERE id IN ( /* ids confirmados de la query 2 o 4 */ );

-- 6) Revocar sesiones de auth del usuario sospechoso
-- UPDATE trivia_auth_sessions
-- SET revoked_at = NOW(), revoked_reason = 'fraud_investigation'
-- WHERE user_id = ( /* id de la query 1 */ )
--   AND revoked_at IS NULL;
