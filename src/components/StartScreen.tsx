'use client';

import { motion } from 'motion/react';
import { Play, Zap, Clock } from 'lucide-react';

interface StartScreenProps {
  weekTitle: string;
  weekDescription?: string;
  onStart: () => void;
}

export default function StartScreen({
  weekTitle,
  weekDescription,
  onStart,
}: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-6"
    >
      {/* Decorative top line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        className="divider-glow mb-12 w-32"
      />

      <div className="glass-card-elevated w-full max-w-sm rounded-2xl p-8 text-center">
        {/* Logo mark */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
          className="mx-auto mb-8"
        >
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-2xl border border-primary/20" />
            {/* Inner glow */}
            <div className="absolute inset-2 rounded-xl bg-primary/5" />
            {/* Icon */}
            <Zap className="relative h-10 w-10 text-primary" strokeWidth={1.5} />
            {/* Corner accents */}
            <div className="absolute -top-1 -right-1 h-3 w-3 border-t border-r border-primary/30 rounded-tr-md" />
            <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-primary/30 rounded-bl-md" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/60">
            Semana 1
          </p>
          <h1 className="mb-1 font-headline text-3xl font-bold tracking-tight text-on-surface">
            Trivia Boston
          </h1>
          <div className="divider-glow mx-auto my-4 w-16" />
        </motion.div>

        {/* Week info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <p className="mb-1 font-headline text-base font-semibold text-primary">
            {weekTitle}
          </p>
          {weekDescription && (
            <p className="mb-6 text-sm text-outline/80">{weekDescription}</p>
          )}
        </motion.div>

        {/* Stats pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/30 bg-surface-variant/20 px-3 py-1.5 text-xs text-outline">
            <Zap className="h-3.5 w-3.5 text-primary/70" />
            <span>3 preguntas</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-outline-variant/30 bg-surface-variant/20 px-3 py-1.5 text-xs text-outline">
            <Clock className="h-3.5 w-3.5 text-tertiary/70" />
            <span>8 seg c/u</span>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          onClick={onStart}
          className="btn-shine flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-4 font-headline text-lg font-semibold text-on-primary shadow-[0_4px_20px_rgba(142,171,255,0.3)] transition-all hover:shadow-[0_6px_30px_rgba(142,171,255,0.4)] active:bg-primary-dim touch-manipulation"
        >
          <Play className="h-5 w-5" fill="currentColor" />
          Jugar
        </motion.button>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-[11px] tracking-wider text-outline/50"
      >
        BOSTON ASSET MANAGER SA
      </motion.p>
    </motion.div>
  );
}
