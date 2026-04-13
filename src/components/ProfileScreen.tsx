'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { LogOut } from 'lucide-react';
import {
  MEDAL_CATALOG,
  CATEGORY_LABELS,
  type Medal,
  type MedalCategory,
} from '@/lib/medals/catalog';
import { getAvatarForUser } from '@/lib/avatar';

interface ProfileScreenProps {
  userId: string;
  userName: string;
  userEmail: string;
  onLogout: () => void;
  unlockedIds?: string[];
}

export default function ProfileScreen({
  userId,
  userName,
  userEmail,
  onLogout,
  unlockedIds = [],
}: ProfileScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const fadeDuration = prefersReducedMotion ? 0 : 0.4;
  const unlockedSet = new Set(unlockedIds);
  const unlockedCount = MEDAL_CATALOG.filter((m) => unlockedSet.has(m.id)).length;
  const totalCount = MEDAL_CATALOG.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const avatarSrc = getAvatarForUser(userId);

  // Group by category
  const grouped = MEDAL_CATALOG.reduce(
    (acc, medal) => {
      (acc[medal.category] ||= []).push(medal);
      return acc;
    },
    {} as Record<MedalCategory, Medal[]>,
  );

  const categories = Object.keys(grouped) as MedalCategory[];

  const stagger = (i: number, base = 0.1) =>
    prefersReducedMotion ? 0 : base + i * 0.04;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: fadeDuration }}
      className="relative z-10 flex min-h-[100dvh] flex-col items-center px-5"
      style={{
        paddingTop: 'max(2rem, calc(env(safe-area-inset-top, 0px) + 2rem))',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 6rem)',
      }}
    >
      <div className="flex w-full max-w-sm flex-1 flex-col">
        {/* 1. Profile header strip */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stagger(0, 0.05) }}
          className="mb-3 flex items-center gap-3"
        >
          <div className="relative shrink-0">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-primary/30 shadow-[0_4px_15px_rgba(29,57,105,0.12)]">
              <Image
                src={avatarSrc}
                alt={userName}
                fill
                sizes="56px"
                className="object-cover"
                priority
              />
            </div>
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-secondary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="boston-title truncate text-lg">{userName}</h1>
            <p className="truncate text-xs text-outline">{userEmail}</p>
          </div>
        </motion.div>

        {/* 2. Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stagger(1, 0.1) }}
          className="mb-3 grid grid-cols-3 gap-2"
        >
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="boston-title text-2xl">
              {unlockedCount}
              <span className="text-outline text-base">/{totalCount}</span>
            </p>
            <p className="text-[10px] uppercase tracking-wider text-outline">
              Medallas
            </p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="boston-title text-2xl">{progressPct}%</p>
            <p className="text-[10px] uppercase tracking-wider text-outline">
              Progreso
            </p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="boston-title text-2xl text-outline/40">&mdash;</p>
            <p className="text-[10px] uppercase tracking-wider text-outline">
              Partidas
            </p>
          </div>
        </motion.div>

        {/* 3. Medal progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: stagger(2, 0.15) }}
          className="mb-4"
        >
          <div className="mb-1 flex items-baseline justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface/60">
              Progreso
            </span>
            <span className="font-mono text-xs tabular-nums text-on-surface">
              <span className="font-bold text-primary">{progressPct}</span>
              <span className="text-outline">%</span>
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[#e2e8f0]"
            role="progressbar"
            aria-valuenow={unlockedCount}
            aria-valuemin={0}
            aria-valuemax={totalCount}
            aria-label={`Medallas desbloqueadas: ${unlockedCount} de ${totalCount}`}
          >
            <motion.div
              initial={{ width: prefersReducedMotion ? `${progressPct}%` : 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { delay: 0.3, duration: 0.8, ease: 'easeOut' }
              }
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(135deg, #1d3969, #2563eb)',
                boxShadow: '0 0 8px rgba(37,99,235,0.5)',
              }}
            />
          </div>
          <p className="mt-1 text-[10px] text-outline">
            {unlockedCount} de {totalCount} medallas desbloqueadas
          </p>
        </motion.div>

        {/* 4. Medals summary grid — flex-1 to fill remaining space */}
        <div className="mb-3 grid flex-1 grid-cols-3 grid-rows-2 gap-2 content-start">
          {categories.map((category, i) => {
            const medals = grouped[category];
            const catUnlocked = medals.filter((m) => unlockedSet.has(m.id)).length;
            const catTotal = medals.length;
            const allDone = catUnlocked === catTotal;
            const noneDone = catUnlocked === 0;
            const Icon = medals[0].icon;

            return (
              <motion.div
                key={category}
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.92 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  prefersReducedMotion
                    ? { delay: 0, duration: 0.15 }
                    : { delay: stagger(i, 0.2), type: 'spring', stiffness: 300 }
                }
                className={`glass-card flex flex-col items-center justify-center rounded-xl p-2.5 text-center ${
                  allDone ? 'border-secondary/40' : ''
                }`}
              >
                <div
                  className={`boston-icon-box-sm mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl ${
                    noneDone ? 'grayscale opacity-40' : ''
                  }`}
                >
                  <Icon
                    className="h-5 w-5"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    noneDone ? 'text-outline/50' : 'text-on-surface/80'
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                </p>
                <p
                  className={`font-mono text-xs tabular-nums ${
                    allDone
                      ? 'font-bold text-secondary'
                      : noneDone
                        ? 'text-outline/50'
                        : 'text-primary'
                  }`}
                >
                  {catUnlocked}/{catTotal}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* 5. Footer — logout */}
        <motion.button
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: prefersReducedMotion ? 0 : 0.5 }}
          onClick={onLogout}
          aria-label="Cerrar sesión"
          className="mt-auto flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-tertiary/40 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-tertiary transition-all hover:border-tertiary/60 hover:bg-tertiary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/80 touch-manipulation"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" focusable="false" />
          Cerrar sesion
        </motion.button>
      </div>
    </motion.div>
  );
}
