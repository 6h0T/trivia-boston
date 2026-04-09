'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Question, AnswerResult } from '@/types/game';
import { useCountdown } from '@/hooks/useCountdown';
import CountdownTimer from './CountdownTimer';
import AnswerOption from './AnswerOption';
import ProgressDots from './ProgressDots';

const TIMER_DURATION = 8;
const REVEAL_DURATION = 2500;
const LABELS = ['A', 'B', 'C', 'D'];

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  results: AnswerResult[];
  isRevealing: boolean;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number, timeRemaining: number) => void;
  onTimeout: () => void;
  onNextQuestion: () => void;
  timerActive: boolean;
}

export default function QuestionCard({
  question,
  questionIndex,
  results,
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

  function getOptionState(optionIndex: number) {
    if (!isRevealing) return 'default' as const;

    if (optionIndex === question.correctIndex) return 'correct' as const;
    if (optionIndex === selectedAnswer) return 'incorrect' as const;
    return 'dimmed' as const;
  }

  const isCorrectAnswer = selectedAnswer === question.correctIndex;
  const feedbackText = isRevealing
    ? isCorrectAnswer
      ? 'Correcto!'
      : selectedAnswer === null
        ? `Tiempo agotado!`
        : `Incorrecto`
    : null;

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-6 pb-8 pt-safe"
      style={{ paddingTop: 'max(3rem, env(safe-area-inset-top, 3rem))' }}
    >
      <div className="w-full max-w-sm">
        {/* Header: progress + category */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8 flex items-center justify-between"
        >
          <ProgressDots
            currentIndex={questionIndex}
            results={results}
            total={3}
          />
          <span className="category-badge rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary/80">
            {question.category}
          </span>
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className="mb-8 flex justify-center"
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
          className="mb-8 text-center font-headline text-xl font-semibold leading-snug text-on-surface"
        >
          {question.text}
        </motion.h2>

        {/* Divider */}
        <div className="divider-glow mx-auto mb-6 w-12" />

        {/* Answer options */}
        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => (
            <AnswerOption
              key={i}
              label={LABELS[i]}
              text={option}
              index={i}
              state={getOptionState(i)}
              onClick={() => onSelectAnswer(i, timeLeft)}
              disabled={isRevealing}
            />
          ))}
        </div>

        {/* Feedback text */}
        {feedbackText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <p
              className={`text-sm font-bold ${
                isCorrectAnswer ? 'text-secondary' : 'text-tertiary'
              }`}
            >
              {feedbackText}
            </p>
            {!isCorrectAnswer && (
              <p className="mt-1 text-xs text-outline">
                Respuesta: {question.options[question.correctIndex]}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
