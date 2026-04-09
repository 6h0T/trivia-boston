'use client';

import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  timeLeft: number;
  progress: number;
  duration: number;
}

const RADIUS = 44;
const STROKE = 5;
const SIZE = 110;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CountdownTimer({
  timeLeft,
  progress,
}: CountdownTimerProps) {
  const isUrgent = timeLeft <= 3 && timeLeft > 0;
  const offset = CIRCUMFERENCE * (1 - progress);
  const displayTime = Math.ceil(timeLeft);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        isUrgent ? 'timer-ring urgent' : 'timer-ring'
      )}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="rotate-[-90deg]"
      >
        {/* Background track */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-surface-variant opacity-20"
        />
        {/* Outer glow ring (subtle) */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS + 4}
          fill="none"
          strokeWidth="1"
          stroke="currentColor"
          className={cn(
            'transition-colors duration-300',
            isUrgent ? 'text-tertiary opacity-20' : 'text-primary opacity-10'
          )}
        />
        {/* Active progress ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={cn(
            'transition-colors duration-300',
            isUrgent ? 'text-tertiary' : 'text-primary'
          )}
          stroke="currentColor"
          style={{
            transition: 'stroke-dashoffset 0.1s linear, color 0.3s',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        <span
          className={cn(
            'font-headline text-3xl font-bold tabular-nums leading-none',
            isUrgent ? 'text-tertiary' : 'text-on-surface'
          )}
        >
          {displayTime}
        </span>
        <span className="mt-0.5 text-[10px] uppercase tracking-widest text-outline">
          seg
        </span>
      </div>
    </div>
  );
}
