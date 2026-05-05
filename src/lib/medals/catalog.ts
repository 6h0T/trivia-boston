import type { LucideIcon } from 'lucide-react';
import {
  Trophy,
  Award,
  Crown,
  Flame,
  Zap,
  Target,
  Medal,
  Star,
  Calendar,
  Sparkles,
} from 'lucide-react';

export type MedalTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export type MedalCategory =
  | 'performance'
  | 'streaks'
  | 'speed'
  | 'persistence'
  | 'milestones'
  | 'ranking';

export interface Medal {
  id: string;
  name: string;
  description: string;
  hint: string;
  tier: MedalTier;
  category: MedalCategory;
  icon: LucideIcon;
  /** Boston Coins otorgadas al desbloquear (10-99 comunes, 100-150 raras). */
  coins: number;
}

// El juego abre 1 dia por semana con 3 intentos diarios.
// Las medallas estan calibradas a esa cadencia: maximo 3 partidas/semana,
// el "ranking" se cierra cuando termina el dia de juego de cada semana.
export const MEDAL_CATALOG: Medal[] = [
  // ─── Milestones ─────────────────────────────────────────────
  {
    id: 'first-blood',
    name: 'Primera Sangre',
    description: 'Completaste tu primera partida.',
    hint: 'Jugá una vez para desbloquearla.',
    tier: 'bronze',
    category: 'milestones',
    icon: Star,
    coins: 10,
  },
  {
    id: 'regular-player',
    name: 'Hincha Fiel',
    description: 'Jugaste en 5 semanas distintas.',
    hint: 'Sumá 5 semanas distintas con al menos una partida.',
    tier: 'silver',
    category: 'milestones',
    icon: Calendar,
    coins: 25,
  },

  // ─── Persistence ─────────────────────────────────────────────
  {
    id: 'try-harder',
    name: 'Insistente',
    description: 'Usaste tus 3 intentos en una misma semana.',
    hint: 'Jugá las 3 partidas disponibles dentro de la misma semana.',
    tier: 'bronze',
    category: 'persistence',
    icon: Target,
    coins: 15,
  },
  {
    id: 'dedication-10',
    name: 'Dedicación',
    description: 'Jugaste 10 partidas en total.',
    hint: 'Llegá a 10 partidas acumuladas.',
    tier: 'gold',
    category: 'persistence',
    icon: Medal,
    coins: 50,
  },

  // ─── Performance ─────────────────────────────────────────────
  {
    id: 'perfect-game',
    name: 'Partida Perfecta',
    description: 'Acertaste las 3 preguntas en una partida.',
    hint: 'Conseguí un 3/3 en cualquier semana.',
    tier: 'silver',
    category: 'performance',
    icon: Trophy,
    coins: 20,
  },
  {
    id: 'perfect-trio',
    name: 'Triple Perfecto',
    description: 'Sacaste 3/3 en 3 semanas distintas.',
    hint: 'Acumulá partidas perfectas en 3 semanas diferentes.',
    tier: 'gold',
    category: 'performance',
    icon: Award,
    coins: 60,
  },
  {
    id: 'perfect-decade',
    name: 'Década Impecable',
    description: '10 partidas perfectas en total.',
    hint: 'Llegá a 10 partidas con 3/3.',
    tier: 'platinum',
    category: 'performance',
    icon: Crown,
    coins: 120,
  },

  // ─── Streaks ─────────────────────────────────────────────────
  {
    id: 'week-streak-3',
    name: 'Racha de Fuego',
    description: 'Jugaste 3 semanas consecutivas.',
    hint: 'No te saltees ninguna semana durante 3 semanas seguidas.',
    tier: 'silver',
    category: 'streaks',
    icon: Flame,
    coins: 30,
  },
  {
    id: 'unbeatable-streak',
    name: 'Racha Invicta',
    description: '3 semanas consecutivas con al menos una partida perfecta.',
    hint: 'Sacá 3/3 en 3 semanas seguidas, sin saltearlas.',
    tier: 'gold',
    category: 'streaks',
    icon: Flame,
    coins: 80,
  },

  // ─── Speed ───────────────────────────────────────────────────
  {
    id: 'speedrun',
    name: 'Velocista',
    description: 'Completaste una partida en menos de 15 segundos.',
    hint: 'Respondé las 3 preguntas a fondo.',
    tier: 'silver',
    category: 'speed',
    icon: Zap,
    coins: 20,
  },
  {
    id: 'perfect-speedrun',
    name: 'Rayo Perfecto',
    description: 'Una partida 3/3 en menos de 10 segundos.',
    hint: 'Combiná velocidad y puntería: 3/3 bajo 10 segundos.',
    tier: 'platinum',
    category: 'speed',
    icon: Sparkles,
    coins: 100,
  },

  // ─── Ranking (semanas ya cerradas) ──────────────────────────
  {
    id: 'podium',
    name: 'En el Podio',
    description: 'Terminaste en el top 3 de una semana cerrada.',
    hint: 'Posicioná tu mejor partida entre las 3 primeras de alguna semana.',
    tier: 'gold',
    category: 'ranking',
    icon: Trophy,
    coins: 75,
  },
  {
    id: 'champion',
    name: 'Rey de la Semana',
    description: 'Quedaste #1 al cierre de una semana.',
    hint: 'Liderá el ranking cuando termine el día de juego.',
    tier: 'platinum',
    category: 'ranking',
    icon: Crown,
    coins: 125,
  },
  {
    id: 'dynasty',
    name: 'Dinastía',
    description: 'Fuiste #1 en 3 semanas cerradas distintas.',
    hint: 'Lográ tres campeonatos semanales a lo largo del torneo.',
    tier: 'platinum',
    category: 'ranking',
    icon: Crown,
    coins: 150,
  },
];

/** Total acumulable si se desbloquean todas las medallas. */
export const TOTAL_MEDAL_COINS = MEDAL_CATALOG.reduce(
  (sum, m) => sum + m.coins,
  0,
);

export const CATEGORY_LABELS: Record<MedalCategory, string> = {
  performance: 'Performance',
  streaks: 'Rachas',
  speed: 'Velocidad',
  persistence: 'Persistencia',
  milestones: 'Hitos',
  ranking: 'Ranking',
};

export const TIER_COLORS: Record<MedalTier, { text: string; bg: string; border: string; glow: string }> = {
  bronze: {
    text: 'text-amber-700',
    bg: 'bg-amber-100/60',
    border: 'border-amber-600/40',
    glow: 'rgba(180, 83, 9, 0.25)',
  },
  silver: {
    text: 'text-slate-500',
    bg: 'bg-slate-100/60',
    border: 'border-slate-400/50',
    glow: 'rgba(100, 116, 139, 0.25)',
  },
  gold: {
    text: 'text-amber-500',
    bg: 'bg-amber-50/70',
    border: 'border-amber-400/50',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  platinum: {
    text: 'text-sky-600',
    bg: 'bg-sky-50/70',
    border: 'border-sky-400/50',
    glow: 'rgba(14, 165, 233, 0.3)',
  },
};
