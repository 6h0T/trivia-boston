'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { PublicQuestion, AnswerResult } from '@/types/game';
import { useCountdown } from '@/hooks/useCountdown';
import CountdownTimer from './CountdownTimer';
import AnswerOption from './AnswerOption';
import ProgressDots from './ProgressDots';

const TIMER_DURATION = 15;
const REVEAL_DURATION = 700;
const LABELS = ['A', 'B', 'C', 'D'];

interface QuestionCardProps {
  question: PublicQuestion;
  questionIndex: number;
  /** Answers collected so far. The client doesn't know correctness yet. */
  answers: { questionId: string; selectedIndex: number | null }[];
  isRevealing: boolean;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  onTimeout: () => void;
  onNextQuestion: () => void;
  timerActive: boolean;
}

export default function QuestionCard({
  question,
  questionIndex,
  answers,
  isRevealing,
  selectedAnswer,
  onSelectAnswer,
  onTimeout,
  onNextQuestion,
  timerActive,
}: QuestionCardProps) {
  const { timeLeft, progress } = useCountdown(
    TIMER_DURATION,
    onTimeout,
    timerActive
  );

  const revealTimerRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    if (isRevealing) {
      revealTimerRef.current = setTimeout(onNextQuestion, REVEAL_DURATION);
    }
    return () => {
      clearTimeout(revealTimerRef.current);
    };
  }, [isRevealing, onNextQuestion]);

  // ProgressDots expects AnswerResult[]. While playing we don't know
  // correctness; show each answered slot as "neutral" (uses the same visual
  // as an unanswered current dot, but filled) by mapping with isCorrect=false.
  // The dots that are already past the current index will appear filled (tertiary).
  // We intentionally keep them neutral-ish by flagging them as answered.
  const neutralResults: AnswerResult[] = answers.map((a) => ({
    questionId: a.questionId,
    selectedIndex: a.selectedIndex,
    isCorrect: false,
  }));

  function getOptionState(optionIndex: number) {
    if (!isRevealing) return 'default' as const;
    if (optionIndex === selectedAnswer) return 'selected' as const;
    return 'dimmed' as const;
  }

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5"
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top, 1.25rem))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
      }}
    >
      <div className="flex w-full max-w-sm flex-1 flex-col">
        {/* Header: progress + category */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 flex items-center justify-between sm:mb-6"
        >
          <ProgressDots
            currentIndex={questionIndex}
            results={neutralResults}
            total={3}
          />
          <span className="category-badge rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary/80 sm:text-[11px]">
            {question.category}
          </span>
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="mb-4 flex justify-center sm:mb-6"
        >
          <CountdownTimer
            timeLeft={timeLeft}
            progress={progress}
            duration={TIMER_DURATION}
          />
        </motion.div>

        {/* Question text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-3 text-center font-headline font-semibold leading-snug text-on-surface sm:mb-5"
          style={{ fontSize: 'clamp(1.05rem, 4.2vw, 1.25rem)' }}
        >
          {question.text}
        </motion.h2>

        {/* Divider */}
        <div className="divider-glow mx-auto mb-4 w-12 sm:mb-5" />

        {/* Neutral "next" banner during reveal — no correct/incorrect hint */}
        <AnimatePresence mode="wait">
          {isRevealing && (
            <motion.div
              key="next-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              role="status"
              aria-live="polite"
              className="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-outline-variant bg-white/60 px-3.5 py-2.5 sm:mb-4 sm:px-4 sm:py-3"
            >
              <ChevronRight
                className="h-4 w-4 text-primary/70"
                strokeWidth={2.5}
              />
              <p className="text-sm font-semibold text-on-surface/80">
                {questionIndex >= 2 ? 'Calculando resultados…' : 'Siguiente pregunta'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer options */}
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {question.options.map((option, i) => (
            <AnswerOption
              key={i}
              label={LABELS[i]}
              text={option}
              index={i}
              state={getOptionState(i)}
              onClick={() => onSelectAnswer(i)}
              disabled={isRevealing}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
