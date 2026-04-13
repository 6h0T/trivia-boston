'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { X, Gamepad2, Star, Clock, Timer } from 'lucide-react';
import Image from 'next/image';
import { getUserPublicProfile, type UserPublicProfile } from '@/app/actions/profile';
import { getAvatarForUser } from '@/lib/avatar';

interface UserProfileModalProps {
  userId: string;
  weekNumber: number;
  onClose: () => void;
}

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatJoinDate(iso: string): string {
  const date = new Date(iso);
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function UserProfileModal({
  userId,
  weekNumber,
  onClose,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserPublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    getUserPublicProfile(userId, weekNumber).then((data) => {
      if (mounted) {
        setProfile(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [userId, weekNumber]);

  const avatarSrc = getAvatarForUser(userId);

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const panelVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { y: '100%', opacity: 0 },
        visible: { y: 0, opacity: 1 },
      };

  const panelTransition = prefersReducedMotion
    ? { duration: 0.1 }
    : { type: 'spring' as const, damping: 28, stiffness: 300 };

  const stats = profile
    ? [
        {
          icon: <Gamepad2 className="h-4 w-4 text-primary" />,
          value: profile.gamesPlayed,
          label: 'Partidas jugadas',
        },
        {
          icon: <Star className="h-4 w-4 text-primary" />,
          value: `${profile.bestScore}/3`,
          label: 'Mejor puntaje',
        },
        {
          icon: <Clock className="h-4 w-4 text-primary" />,
          value: profile.bestTimeMs != null ? formatTime(profile.bestTimeMs) : '—',
          label: 'Mejor tiempo',
        },
        {
          icon: <Timer className="h-4 w-4 text-primary" />,
          value: profile.avgTimeMs != null ? formatTime(profile.avgTimeMs) : '—',
          label: 'Tiempo promedio',
        },
      ]
    : [];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Perfil de usuario"
    >
      <motion.div
        className="relative w-full max-w-sm rounded-t-3xl bg-white p-6 sm:rounded-2xl"
        style={{
          boxShadow: '0 -4px 30px rgba(29,57,105,0.15)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)',
        }}
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={panelTransition}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:bg-slate-100"
          aria-label="Cerrar perfil"
        >
          <X className="h-4 w-4 text-[#64748b]" />
        </button>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          </div>
        )}

        {!loading && !profile && (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-[#374151]">
              Perfil no disponible
            </p>
          </div>
        )}

        {!loading && profile && (
          <>
            {/* Avatar */}
            <div className="mb-3 flex justify-center">
              <div
                className="overflow-hidden rounded-2xl border border-primary/20"
                style={{ width: 80, height: 80 }}
              >
                <Image
                  src={avatarSrc}
                  alt={profile.name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Name */}
            <h2
              className="boston-title mb-1 text-center text-xl"
              style={{ color: '#1d3969' }}
            >
              {profile.name}
            </h2>

            {/* Join date */}
            <p className="mb-4 text-center text-xs text-[#64748b]">
              Miembro desde {formatJoinDate(profile.joinedAt)}
            </p>

            {/* Divider */}
            <div className="divider-glow mx-auto mb-5 w-20" />

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-3"
                  style={{ transition: 'all 0.3s ease' }}
                >
                  <div className="boston-icon-box-sm mb-2">{stat.icon}</div>
                  <span
                    className="text-lg font-bold tabular-nums"
                    style={{ color: '#1d3969' }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-[10px] font-medium text-[#64748b]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
