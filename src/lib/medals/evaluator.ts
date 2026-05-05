import { MEDAL_CATALOG } from './catalog';

export interface SessionRow {
  weekNumber: number;
  score: number;
  totalTimeMs: number;
}

export interface EvaluatorInput {
  sessions: SessionRow[];
  /** Posiciones del usuario en cada semana CERRADA (week_number → posicion 1-based). */
  closedWeekPositions: Record<number, number>;
}

export interface EvaluationResult {
  unlockedIds: string[];
  /** 0..1 progreso para medallas no desbloqueadas (cuando aplica). */
  progress: Record<string, number>;
}

function hasConsecutiveRun(weeksAsc: number[], length: number): boolean {
  if (weeksAsc.length < length) return false;
  let run = 1;
  for (let i = 1; i < weeksAsc.length; i++) {
    if (weeksAsc[i] === weeksAsc[i - 1] + 1) {
      run += 1;
      if (run >= length) return true;
    } else {
      run = 1;
    }
  }
  return false;
}

function maxConsecutiveRun(weeksAsc: number[]): number {
  if (weeksAsc.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < weeksAsc.length; i++) {
    if (weeksAsc[i] === weeksAsc[i - 1] + 1) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

export function evaluateMedals(input: EvaluatorInput): EvaluationResult {
  const { sessions, closedWeekPositions } = input;

  const totalGames = sessions.length;
  const perfectGames = sessions.filter((s) => s.score === 3).length;

  const distinctWeeksAsc = Array.from(
    new Set(sessions.map((s) => s.weekNumber)),
  ).sort((a, b) => a - b);

  const distinctPerfectWeeksAsc = Array.from(
    new Set(sessions.filter((s) => s.score === 3).map((s) => s.weekNumber)),
  ).sort((a, b) => a - b);

  const gamesPerWeek = sessions.reduce<Record<number, number>>((acc, s) => {
    acc[s.weekNumber] = (acc[s.weekNumber] ?? 0) + 1;
    return acc;
  }, {});
  const maxGamesInAnyWeek = Math.max(0, ...Object.values(gamesPerWeek));

  const bestTimeMs = sessions.length
    ? Math.min(...sessions.map((s) => s.totalTimeMs))
    : null;
  const bestPerfectTimeMs = perfectGames
    ? Math.min(
        ...sessions.filter((s) => s.score === 3).map((s) => s.totalTimeMs),
      )
    : null;

  const podiumWeeks = Object.values(closedWeekPositions).filter((p) => p <= 3).length;
  const championWeeks = Object.values(closedWeekPositions).filter((p) => p === 1).length;

  const unlocked = new Set<string>();
  const progress: Record<string, number> = {};

  const award = (id: string, condition: boolean, prog?: number) => {
    if (condition) unlocked.add(id);
    else if (prog !== undefined) progress[id] = Math.max(0, Math.min(1, prog));
  };

  // Milestones
  award('first-blood', totalGames >= 1, totalGames / 1);
  award(
    'regular-player',
    distinctWeeksAsc.length >= 5,
    distinctWeeksAsc.length / 5,
  );

  // Persistence
  award('try-harder', maxGamesInAnyWeek >= 3, maxGamesInAnyWeek / 3);
  award('dedication-10', totalGames >= 10, totalGames / 10);

  // Performance
  award('perfect-game', perfectGames >= 1, perfectGames / 1);
  award(
    'perfect-trio',
    distinctPerfectWeeksAsc.length >= 3,
    distinctPerfectWeeksAsc.length / 3,
  );
  award('perfect-decade', perfectGames >= 10, perfectGames / 10);

  // Streaks
  const longestStreak = maxConsecutiveRun(distinctWeeksAsc);
  const longestPerfectStreak = maxConsecutiveRun(distinctPerfectWeeksAsc);
  award('week-streak-3', longestStreak >= 3, longestStreak / 3);
  award(
    'unbeatable-streak',
    hasConsecutiveRun(distinctPerfectWeeksAsc, 3),
    longestPerfectStreak / 3,
  );

  // Speed
  award('speedrun', bestTimeMs !== null && bestTimeMs < 15_000);
  award(
    'perfect-speedrun',
    bestPerfectTimeMs !== null && bestPerfectTimeMs < 10_000,
  );

  // Ranking (solo semanas ya cerradas)
  award('podium', podiumWeeks >= 1, podiumWeeks / 1);
  award('champion', championWeeks >= 1, championWeeks / 1);
  award('dynasty', championWeeks >= 3, championWeeks / 3);

  // Filtrar progreso a ids del catalogo conocidos (defensa)
  const validIds = new Set(MEDAL_CATALOG.map((m) => m.id));
  const filteredProgress: Record<string, number> = {};
  for (const [k, v] of Object.entries(progress)) {
    if (validIds.has(k) && !unlocked.has(k)) filteredProgress[k] = v;
  }

  return {
    unlockedIds: Array.from(unlocked),
    progress: filteredProgress,
  };
}
