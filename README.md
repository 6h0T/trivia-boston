# Trivia Boston

Trivia semanal de futbol, economia e historia — desarrollada para **Boston Asset Manager SA** como parte de la campana **Prode Boston Coins - Mundial 2026**.

## Stack

| Tecnologia | Version |
|---|---|
| Next.js (App Router) | 16.2.3 |
| React | 19.2.5 |
| Tailwind CSS | v4 |
| motion/react | 12.x |
| Supabase | @supabase/ssr + supabase-js |
| Vercel Analytics | 2.x |
| TypeScript | 5.x |

## Inicio rapido

```bash
# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env.local
# Completar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Desarrollo (puerto 3334)
npm run dev -- -p 3334

# Build de produccion
npm run build
npm start
```

## Variables de entorno

| Variable | Descripcion |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key de Supabase |
| `ADMIN_USERNAME` | Usuario del panel admin |
| `ADMIN_PASSWORD_HASH` | SHA-256 hex de la password admin (`echo -n 'tu_password' \| sha256sum`) |

## Estructura del proyecto

```
trivia-boston/
├── docs/                          # Documentos markdown (TyC, medallas, etc.)
│   ├── terminos-y-condiciones.md
│   └── medals/
├── public/                        # Assets estaticos
│   ├── favicon.ico
│   ├── logo-boston.png
│   ├── trophy-mundial.png
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (metadata, viewport, analytics)
│   │   ├── page.tsx               # Pagina principal → TriviaGame
│   │   ├── globals.css            # Tema global, glass cards, utilidades
│   │   ├── actions/               # Server Actions (Supabase)
│   │   │   ├── auth.ts            # registerUser, loginUser
│   │   │   ├── sessions.ts        # saveSession
│   │   │   ├── leaderboard.ts     # getLeaderboard
│   │   │   └── profile.ts         # getUserPublicProfile
│   │   └── docs/                  # Paginas de documentacion (SSR markdown)
│   │       ├── page.tsx           # Indice de docs
│   │       └── [...slug]/page.tsx # Render de cada .md
│   ├── components/
│   │   ├── TriviaGame.tsx         # Orquestador principal de fases
│   │   ├── AuthScreen.tsx         # Login / Registro
│   │   ├── StartScreen.tsx        # Pantalla de inicio (saludo + jugar)
│   │   ├── QuestionCard.tsx       # Pregunta con timer y opciones
│   │   ├── AnswerOption.tsx       # Opcion individual de respuesta
│   │   ├── CountdownTimer.tsx     # Timer circular de 8 segundos
│   │   ├── ProgressDots.tsx       # Indicador de progreso (3 dots)
│   │   ├── ResultsScreen.tsx      # Pantalla de resultados + guardar sesion
│   │   ├── LeaderboardScreen.tsx  # Ranking con podio top-3 + lista
│   │   ├── UserProfileModal.tsx   # Modal de perfil publico (desde ranking)
│   │   ├── ProfileScreen.tsx      # Dashboard de perfil con medallas
│   │   ├── BostonPlusScreen.tsx   # Planes de suscripcion Boston+
│   │   ├── BottomNav.tsx          # Barra de navegacion inferior
│   │   └── StadiumBackground.tsx  # Fondo animado
│   ├── data/
│   │   └── questions.ts           # Pool de preguntas + randomizer (3 al azar por partida)
│   ├── hooks/
│   │   ├── useAuth.ts             # Estado de autenticacion (localStorage)
│   │   ├── useGameState.ts        # Maquina de estados del juego
│   │   └── useCountdown.ts        # Timer regresivo
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── hash.ts            # PBKDF2 password hashing (Web Crypto)
│   │   │   ├── session.ts         # Sesion en localStorage
│   │   │   └── fingerprint.ts     # Fingerprint de dispositivo
│   │   ├── avatar.ts              # Generacion de avatars por usuario
│   │   ├── docs/loader.ts         # Lector de archivos .md desde docs/
│   │   ├── medals/catalog.ts      # Catalogo de medallas (tiers, categorias)
│   │   ├── supabase/
│   │   │   ├── client.ts          # Cliente browser (createBrowserClient)
│   │   │   └── server.ts          # Cliente server (createServerClient)
│   │   └── utils.ts               # Utilidades (cn, clsx, tailwind-merge)
│   └── types/
│       └── game.ts                # Tipos globales (GamePhase, GameState, etc.)
└── package.json
```

## Navegacion y fases del juego

La app es una SPA con navegacion por fases controlada por `useGameState`. El componente `TriviaGame.tsx` orquesta todas las pantallas con `AnimatePresence`.

### Flujo principal

```
AuthScreen (login/registro)
    ↓
StartScreen (saludo + boton "Jugar")
    ↓
QuestionCard x3 (timer 8s por pregunta)
    ↓
ResultsScreen (score + tiempo + guardar en Supabase)
    ↓
  [Ver Ranking]         [Jugar de nuevo]
LeaderboardScreen       → vuelve a StartScreen
```

### Navegacion por tabs (BottomNav)

Disponible una vez autenticado en las fases: `start`, `leaderboard`, `profile`, `bostonplus`, `finished`.

| Tab | Pantalla | Descripcion |
|---|---|---|
| Inicio | `StartScreen` | Saludo con nombre, titulo de la semana, CTA "Jugar" |
| Boston+ | `BostonPlusScreen` | Planes de suscripcion (Freemium, Premium, Premium+) |
| Ranking | `LeaderboardScreen` | Podio top-3 + lista, click para ver perfil |
| Perfil | `ProfileScreen` | Dashboard con medallas, progreso, categorias |

### Fases (`GamePhase`)

| Fase | Pantalla | Descripcion |
|---|---|---|
| `auth` | AuthScreen | Login o registro con email/password |
| `start` | StartScreen | Menu principal |
| `playing` | QuestionCard | Pregunta activa con timer |
| `revealing` | QuestionCard | Revelacion de respuesta correcta |
| `finished` | ResultsScreen | Puntaje final y tiempo total |
| `leaderboard` | LeaderboardScreen | Ranking semanal |
| `profile` | ProfileScreen | Perfil del usuario con medallas |
| `bostonplus` | BostonPlusScreen | Planes de suscripcion |

## Rutas

| Ruta | Tipo | Descripcion |
|---|---|---|
| `/` | Client | App principal (SPA, todas las pantallas) |
| `/docs` | SSR | Indice de documentos markdown |
| `/docs/[...slug]` | SSR | Documento individual (ej: `/docs/terminos-y-condiciones`) |

## Server Actions

| Accion | Archivo | Descripcion |
|---|---|---|
| `registerUser(name, email, password, fingerprint, phone?)` | `actions/auth.ts` | Crea usuario con password hasheado (PBKDF2). Aplica anti-abuse y abre sesión auth |
| `loginUser(email, password, fingerprint)` | `actions/auth.ts` | Autentica usuario existente. Desplaza la sesión previa si la había |
| `logoutUser()` | `actions/auth.ts` | Revoca la sesión activa del usuario y limpia la cookie httpOnly |
| `saveSession(userId, weekNumber, score, totalTimeMs)` | `actions/sessions.ts` | Guarda resultado de partida. Requiere sesión auth activa |
| `getLeaderboard(weekNumber, limit?)` | `actions/leaderboard.ts` | Mejor partida por usuario por semana |
| `getUserPublicProfile(userId, weekNumber)` | `actions/profile.ts` | Perfil publico (stats de partidas) |

## Base de datos (Supabase)

Todas las tablas usan prefijo `trivia_` para aislamiento.

### Tablas

**`trivia_users`** — Usuarios registrados
- `id` (uuid, PK), `name`, `email` (unique), `phone`, `password_hash`, `created_at`

**`trivia_sessions`** — Partidas completadas
- `id` (uuid, PK), `user_id` (FK → trivia_users), `week_number`, `score` (0-3), `total_time_ms`, `completed_at`

**`trivia_fingerprints`** — Devices conocidos por usuario
- `id`, `user_id`, `ip_hash`, `fingerprint_hash`, `user_agent`

**`trivia_attempts`** — Audit log de registros y logins
- `id`, `kind` (`register`/`login`), `email`, `ip_hash`, `fingerprint_hash`, `success`, `created_at`

**`trivia_auth_sessions`** — Sesiones de autenticacion activas
- `id` (uuid, PK = token de la cookie httpOnly), `user_id`, `fingerprint_hash`, `ip_hash`, `user_agent`, `created_at`, `last_seen_at`, `revoked_at`, `revoked_reason` (`displaced`/`logout`/`expired`)
- 1 fila activa (`revoked_at IS NULL`) por `user_id`. Al hacer login se revoca la anterior con `displaced` y se crea una nueva.

**`trivia_admin_sessions`** — Sesiones del panel admin
- `id` (uuid, PK = valor de la cookie `admin_session`), `ip_hash`, `user_agent`, `created_at`, `last_seen_at`, `expires_at`, `revoked_at`
- TTL 8h. La cookie no contiene el secreto: lleva el UUID de la fila, que el server valida en cada request.

**`trivia_admin_attempts`** — Audit log de intentos de login admin
- `id`, `ip_hash`, `success`, `created_at`. Usado para rate limit por IP (5 fallidos / 15 min).

### Vista

**`trivia_leaderboard`** — Mejor partida por usuario por semana (score DESC, time ASC)

### RLS

- Lectura publica para leaderboard
- Insert publico (registro abierto, sin Supabase Auth)
- `trivia_auth_sessions` con RLS habilitada (escritura solo via server actions)

### Anti-abuse y sesiones

- **1 cuenta por dispositivo** (fingerprint canvas + UA + screen + timezone hasheados)
- **Maximo 2 cuentas por IP** (lifetime, sin ventana de tiempo) — bloquea re-registro desde la misma red despues de 2 cuentas
- **Maximo 5 logins fallidos cada 15 min** por (IP + fingerprint)
- **1 sesion auth activa por usuario** — al loguearse desde un device nuevo, la sesion previa queda revocada como `displaced`. El device viejo se entera al siguiente server action (recibe `error: 'session_expired'`) y desloguea con aviso al usuario.
- Cookie de sesion: `trivia_session` (httpOnly, secure, sameSite=Lax, 30 dias). El UUID adentro es el id de la fila en `trivia_auth_sessions`. La revocacion real la maneja el server, no el TTL del cookie.

### Admin auth

- Login en `/admin/login`. Credenciales por env vars: `ADMIN_USERNAME` y `ADMIN_PASSWORD_HASH` (SHA-256 hex de la password). Sin env vars el login admin queda deshabilitado.
- Comparaciones timing-safe (constant-time) para usuario y hash.
- **Rate limit**: 5 logins fallidos por IP cada 15 min (`trivia_admin_attempts`).
- Cookie `admin_session` (httpOnly, secure, sameSite=Lax, 8h). Lleva el UUID de la fila en `trivia_admin_sessions` — el server valida que la fila exista, no este revocada y no haya expirado en cada request. La cookie por si sola no autoriza nada.
- Logout revoca la fila en DB y limpia la cookie.

### Migraciones SQL

Las migraciones viven en `scripts/migrations/`:

- `2026-04-15_auth_sessions.sql` — tabla `trivia_auth_sessions` + indice IP en `trivia_fingerprints`
- `2026-04-15_admin_sessions.sql` — tablas `trivia_admin_sessions` + `trivia_admin_attempts` (admin auth hardening)

## Sistema de medallas

Catalogo en `src/lib/medals/catalog.ts` con 6 categorias:

| Categoria | Ejemplos |
|---|---|
| Performance | Partida Perfecta, Sin Errores |
| Streaks | Racha de 3, Racha de 5 |
| Speed | Rayo, Velocista |
| Persistence | Constante, Veterano |
| Milestones | Primera Partida, 10 Partidas |
| Ranking | Top 3, Campeon Semanal |

Tiers: **Bronze** → **Silver** → **Gold** → **Platinum**

## UI Kit

Basado en el UI Kit de Boston Asset Manager:

- **Contenedores**: tarjetas blancas solidas (`bg: #ffffff`, `border: 1px solid #e2e8f0`, `box-shadow: rgba(29,57,105)`)
- **Colores**: Primary `#1d3969`, Accent `#2563eb`, Surface `#f8fafc`
- **Clases CSS**: `.glass-card`, `.glass-card-elevated`, `.boston-cta`, `.boston-title`, `.boston-overline`, `.boston-icon-box`, `.divider-glow`, `.btn-shine`
- **Responsive**: `max-w-sm` mobile → `sm:max-w-lg` → `md:max-w-2xl`/`md:max-w-3xl` desktop
- **Animaciones**: motion/react con `useReducedMotion`, spring transitions, staggered reveals

## Documentacion legal

- [Terminos y Condiciones](/docs/terminos-y-condiciones) — Prode Boston Coins, Mundial 2026

## Deploy

El proyecto esta configurado para deploy en **Vercel** con analytics integrado.

```bash
# Build
npm run build

# El deploy se realiza automaticamente via Vercel Git Integration
```

---

**Boston Asset Manager SA** — Campana Prode Boston Coins, Mundial 2026
