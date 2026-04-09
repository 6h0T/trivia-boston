'use client';

import { motion } from 'motion/react';
import { RotateCcw, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { AnswerResult, WeeklyTrivia } from '@/types/game';

interface ResultsScreenProps {
  results: AnswerResult[];
  week: WeeklyTrivia;
  score: number;
  onRestart: () => void;
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

export default function ResultsScreen({
  results,
  week,
  score,
  onRestart,
}: ResultsScreenProps) {
  const { text: message, sub: subtitle } = getMessage(score);
  const isPerfect = score === 3;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6"
    >
      <div className="glass-card-elevated w-full max-w-sm rounded-2xl p-8">
        {/* Score */}
        <div className="mb-6 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0, 1.4, 1], rotate: [10, -5, 0] }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            className={`relative mb-3 inline-block font-headline text-7xl font-bold tabular-nums ${
              isPerfect ? 'text-secondary' : 'text-primary'
            }`}
          >
            {isPerfect && <div className="confetti-burst" />}
            {score}
            <span className="text-3xl text-outline/50">/3</span>
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
                      ? 'fill-secondary text-secondary drop-shadow-[0_0_6px_rgba(63,255,139,0.5)]'
                      : 'text-surface-variant/40'
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
        </div>

        <div className="divider-glow mx-auto mb-6 w-20" />

        {/* Week title */}
        <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wider text-primary/60">
          {week.title}
        </p>

        {/* Question results */}
        <div className="mb-8 space-y-2.5">
          {results.map((result, i) => {
            const question = week.questions[i];
            return (
              <motion.div
                key={result.questionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.12 }}
                className={`flex items-start gap-3 rounded-xl p-3 ${
                  result.isCorrect
                    ? 'bg-secondary/5 border border-secondary/10'
                    : 'bg-surface-variant/20 border border-outline-variant/10'
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
                    {question.text}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-secondary/80">
                    {question.options[question.correctIndex]}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Restart button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          onClick={onRestart}
          className="btn-shine flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-4 font-headline text-lg font-semibold text-on-primary shadow-[0_4px_20px_rgba(142,171,255,0.3)] transition-all hover:shadow-[0_6px_30px_rgba(142,171,255,0.4)] active:bg-primary-dim touch-manipulation"
        >
          <RotateCcw className="h-5 w-5" />
          Jugar de nuevo
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-10 text-[11px] tracking-wider text-outline/50"
      >
        BOSTON ASSET MANAGER SA
      </motion.p>
    </motion.div>
  );
}
