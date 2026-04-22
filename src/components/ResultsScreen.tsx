'use client';

import { motion } from 'motion/react';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Trophy,
  AlertTriangle,
} from 'lucide-react';
import { AnswerResult, PublicQuestion } from '@/types/game';
import type { SubmitError } from '@/hooks/useGameState';

interface ResultsScreenProps {
  results: AnswerResult[];
  questions: PublicQuestion[];
  week: { weekNumber: number; title: string; description?: string };
  score: number;
  totalTimeMs: number;
  attemptsRemaining: number | null;
  submitError: SubmitError | null;
  isSubmitting: boolean;
  onRestart: () => void;
  onShowLeaderboard: () => void;
}

function getMessage(score: number): { text: string; sub: string } {
  switch (score) {
    case 0:
      return { text: 'Mejor suerte la proxima!', sub: 'No te rindas' };
    case 1:
      return { text: 'Buen intento!', sub: 'Vas por buen camino' };
    case 2:
      return { text: 'Bien ahi!', sub: 'Casi perfecto' };
    case 3:
      return { text: 'Perfecto!', sub: 'Sos un crack' };
    default:
      return { text: '', sub: '' };
  }
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function errorMessage(err: SubmitError): string {
  switch (err) {
    case 'daily_limit_reached':
      return 'Ya usaste tus 3 intentos de hoy. Volvé mañana.';
    case 'already_submitted':
      return 'Esta partida ya fue registrada.';
    case 'invalid_attempt':
      return 'La partida no es válida. Probá de nuevo.';
    case 'save_failed':
      return 'No pudimos guardar tu partida. Probá de nuevo.';
    case 'session_expired':
      return 'Se cerró tu sesión. Volvé a iniciar sesión.';
    default:
      return 'Ocurrió un error. Probá de nuevo.';
  }
}

export default function ResultsScreen({
  results,
  questions,
  week,
  score,
  totalTimeMs,
  attemptsRemaining,
  submitError,
  isSubmitting,
  onRestart,
  onShowLeaderboard,
}: ResultsScreenProps) {
  const { text: message, sub: subtitle } = getMessage(score);
  const isPerfect = score === 3;
  const limitReached =
    submitError === 'daily_limit_reached' || attemptsRemaining === 0;

  // Build a questionId → PublicQuestion lookup so results match by id.
  const questionsById = new Map<string, PublicQuestion>();
  for (const q of questions) questionsById.set(q.id, q);

  if (isSubmitting) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-nav pt-6 sm:px-6 sm:pt-10"
      >
        <div className="glass-card-elevated w-full max-w-sm rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-semibold text-on-surface">
            Calculando resultados…
          </p>
        </div>
      </motion.div>
    );
  }

  if (submitError && submitError !== 'daily_limit_reached') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-nav pt-6 sm:px-6 sm:pt-10"
      >
        <div className="glass-card-elevated w-full max-w-sm rounded-2xl p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-tertiary/15 text-tertiary">
            <AlertTriangle className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <p className="mb-4 text-sm font-semibold text-on-surface">
            {errorMessage(submitError)}
          </p>
          <button
            onClick={onRestart}
            className="boston-cta btn-shine flex w-full items-center justify-center gap-2.5 px-6 py-4 text-sm touch-manipulation"
          >
            <RotateCcw className="h-5 w-5" />
            Reintentar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-5 pb-nav pt-6 sm:px-6 sm:pt-10"
    >
      <div className="glass-card-elevated w-full max-w-sm rounded-2xl p-6 sm:p-8">
        {/* Score */}
        <div className="mb-4 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.4, 1], rotate: [10, -5, 0] }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            className={`relative mb-2 inline-block font-headline text-6xl font-bold tabular-nums leading-none sm:mb-3 sm:text-7xl ${
              isPerfect ? 'text-secondary' : 'text-primary'
            }`}
          >
            {isPerfect && <div className="confetti-burst" />}
            {score}
            <span className="text-2xl text-outline/50 sm:text-3xl">/3</span>
          </motion.div>

          {/* Stars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-3 flex items-center justify-center gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.55 + i * 0.1, type: 'spring', stiffness: 300 }}
              >
                <Star
                  className={`h-5 w-5 ${
                    i < score
                      ? 'fill-secondary text-secondary drop-shadow-[0_0_6px_rgba(13,148,136,0.55)]'
                      : 'text-surface-variant/30'
                  }`}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg font-bold text-on-surface"
          >
            {message}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-outline"
          >
            {subtitle}
          </motion.p>

          {/* Total time */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-outline-variant bg-[#f8fafc] px-3 py-1.5 font-mono text-xs tabular-nums text-outline"
          >
            <Clock className="h-3.5 w-3.5 text-primary/70" />
            {formatTime(totalTimeMs)}
          </motion.div>
        </div>

        <div className="divider-glow mx-auto mb-5 mt-3 w-20" />

        {/* Week title */}
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wider text-primary/60">
          {week.title}
        </p>

        {/* Question results */}
        <div className="mb-5 space-y-2 sm:mb-6 sm:space-y-2.5">
          {results.map((result, i) => {
            const question = questionsById.get(result.questionId);
            return (
              <motion.div
                key={result.questionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
                className={`flex items-start gap-2.5 rounded-xl p-2.5 sm:gap-3 sm:p-3 ${
                  result.isCorrect
                    ? 'bg-secondary/5 border border-secondary/10'
                    : 'bg-[#f8fafc] border border-outline-variant'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {result.isCorrect ? (
                    <CheckCircle className="h-4.5 w-4.5 text-secondary" />
                  ) : result.selectedIndex === null ? (
                    <Clock className="h-4.5 w-4.5 text-outline/60" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5 text-tertiary" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium leading-snug text-on-surface/80">
                    {question?.text ?? ''}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Attempts remaining / limit reached */}
        {attemptsRemaining !== null && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className={`mb-3 text-center text-xs font-medium ${
              limitReached ? 'text-tertiary' : 'text-outline'
            }`}
          >
            {limitReached
              ? 'Ya usaste tus 3 intentos de hoy. Volvé mañana.'
              : `Te ${attemptsRemaining === 1 ? 'queda' : 'quedan'} ${attemptsRemaining} de 3 ${
                  attemptsRemaining === 1 ? 'intento' : 'intentos'
                } hoy`}
          </motion.p>
        )}

        {/* Primary: restart */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileTap={{ scale: limitReached ? 1 : 0.97 }}
          whileHover={{ y: limitReached ? 0 : -2 }}
          onClick={onRestart}
          disabled={limitReached}
          className="boston-cta btn-shine flex w-full items-center justify-center gap-2.5 px-6 py-4 text-sm touch-manipulation disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-5 w-5" />
          Jugar de nuevo
        </motion.button>

        {/* Secondary: leaderboard */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onShowLeaderboard}
          className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-outline-variant bg-white px-6 py-3 text-sm font-semibold text-outline transition-all hover:border-primary/40 hover:text-primary touch-manipulation"
        >
          <Trophy className="h-4 w-4" />
          Ver ranking
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.05 }}
        className="mt-6 flex flex-col items-center gap-1.5 sm:mt-8"
      >
        <p className="text-[11px] font-semibold tracking-wider text-black">
          BOSTON ASSET MANAGER SA
        </p>
        <a
          href="/docs/terminos-y-condiciones"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] tracking-wide text-primary/70 underline underline-offset-2 hover:text-primary transition-colors"
        >
          Terminos y Condiciones
        </a>
      </motion.div>
    </motion.div>
  );
}
