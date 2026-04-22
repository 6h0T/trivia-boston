import { Question, WeeklyTrivia } from '@/types/game';

/* ───────────── Pool de preguntas – Semana 1 ───────────── */

const week1Pool: Question[] = [
  {
    id: 'w1q1',
    text: '¿En qué país se jugó el primer Mundial de la historia en 1930?',
    options: ['Brasil', 'Argentina', 'Uruguay', 'Italia'],
    correctIndex: 2,
    category: 'Fútbol',
  },
  {
    id: 'w1q2',
    text: '¿Qué hecho político sacudió a Argentina el mismo año del primer Mundial?',
    options: [
      'La creación del Banco Central',
      'La primera hiperinflación',
      'El primer golpe de Estado cívico-militar',
      'La fundación de YPF',
    ],
    correctIndex: 2,
    category: 'Economía',
  },
  {
    id: 'w1q3',
    text: '¿Por qué solo 12 de las 40 naciones afiliadas a la FIFA viajaron al primer Mundial en 1930?',
    options: [
      'Por conflictos políticos entre países',
      'Por la distancia y falta de vuelos comerciales',
      'Por la caída del mercado de valores de Wall Street en 1929 que golpeó la economía de muchos países',
      'Por una epidemia que afectaba Europa',
    ],
    correctIndex: 2,
    category: 'Mercado de Capitales',
  },
  {
    id: 'w1q4',
    text: '¿Quién fue el goleador del primer Mundial de la historia?',
    options: [
      'José Nasazzi',
      'Guillermo Stábile',
      'Obdulio Varela',
      'Héctor Scarone',
    ],
    correctIndex: 1,
    category: 'Fútbol',
  },
  {
    id: 'w1q5',
    text: '¿En qué estadio se jugó la final del Mundial 1930 entre Uruguay y Argentina?',
    options: ['Maracaná', 'Estadio Centenario', 'Monumental', 'Wembley'],
    correctIndex: 1,
    category: 'Fútbol',
  },
  {
    id: 'w1q6',
    text: '¿Qué significa diversificar una inversión?',
    options: [
      'Invertir todo en el activo más rentable',
      'Guardar el dinero en efectivo',
      'Cambiar de inversión cada mes',
      'Distribuir el capital en distintos activos para reducir el riesgo',
    ],
    correctIndex: 3,
    category: 'Mercado de Capitales',
  },
  {
    id: 'w1q7',
    text: 'Cuando caen fuerte las acciones, ¿cómo se llama ese movimiento del mercado?',
    options: [
      'Rally',
      'Corrección o caída del mercado',
      'Expansión',
      'Rebote técnico',
    ],
    correctIndex: 1,
    category: 'Mercado de Capitales',
  },
  {
    id: 'w1q8',
    text: '¿Cuál fue la inflación mensual en Argentina según el INDEC en marzo de 2026?',
    options: ['1,9%', '2,9%', '3,4%', '4,2%'],
    correctIndex: 2,
    category: 'Economía',
  },
  {
    id: 'w1q9',
    text: '¿Cuántos goles tiene Lionel Messi como máximo goleador histórico de la Selección Argentina?',
    options: ['89 goles', '98 goles', '108 goles', '115 goles'],
    correctIndex: 3,
    category: 'Fútbol',
  },
  {
    id: 'w1q10',
    text: '¿Cuánto habilitó el FMI desembolsar a Argentina en abril de 2026?',
    options: [
      'USD 500 millones',
      'USD 1.000 millones',
      'USD 2.000 millones',
      'USD 5.000 millones',
    ],
    correctIndex: 1,
    category: 'Mercado de Capitales',
  },
];

/* ───────────── Semanas ───────────── */

interface WeekPool {
  weekNumber: number;
  title: string;
  description?: string;
  /** Date string YYYY-MM-DD when this trivia is playable (America/Argentina/Buenos_Aires) */
  availableDate: string;
  /** Opening time HH:mm (UTC-3) */
  openTime: string;
  /** Closing time HH:mm (UTC-3), inclusive */
  closeTime: string;
  pool: Question[];
}

const weekPools: WeekPool[] = [
  {
    weekNumber: 1,
    title: 'Primer Mundial de la Historia',
    description: 'Uruguay 1930 - El torneo que lo empezó todo',
    availableDate: '2026-04-22',
    openTime: '10:00',
    closeTime: '23:59',
    pool: week1Pool,
  },
];

/* ───────────── Randomizer ───────────── */

/** Fisher-Yates shuffle (in-place, returns same array) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Shuffle the options of a question while keeping correctIndex accurate */
function shuffleOptions(q: Question): Question {
  const correctOption = q.options[q.correctIndex];
  const shuffled = shuffle([...q.options]);
  return {
    ...q,
    options: shuffled,
    correctIndex: shuffled.indexOf(correctOption),
  };
}

/** Pick `count` random questions from a pool, with shuffled options */
function pickRandom(pool: Question[], count: number): Question[] {
  const picked = shuffle([...pool]).slice(0, count);
  return picked.map(shuffleOptions);
}

/** Flat list of week metadata (for admin dashboard, lookups, etc.) */
export const weeks = weekPools.map((wp) => ({
  weekNumber: wp.weekNumber,
  title: wp.title,
  description: wp.description,
  availableDate: wp.availableDate,
  openTime: wp.openTime,
  closeTime: wp.closeTime,
}));

const TRIVIA_TIMEZONE = 'America/Argentina/Buenos_Aires';

/** Current date+time in the trivia timezone (UTC-3). */
function nowInTriviaTZ(): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TRIVIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(hour) * 60 + Number(get('minute')),
  };
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export type WeekAvailabilityStatus = 'before' | 'open' | 'after';

/** Check if a given week is playable right now */
export function isWeekAvailable(weekNumber: number): boolean {
  const wp = weekPools.find((w) => w.weekNumber === weekNumber);
  if (!wp) return false;
  const { date, minutes } = nowInTriviaTZ();
  if (date !== wp.availableDate) return false;
  return minutes >= timeToMinutes(wp.openTime) && minutes <= timeToMinutes(wp.closeTime);
}

/** Availability info for the current week */
export function getCurrentWeekAvailability(): {
  available: boolean;
  availableDate: string;
  openTime: string;
  closeTime: string;
  status: WeekAvailabilityStatus;
  weekNumber: number;
} {
  const wp = weekPools[0];
  const { date, minutes } = nowInTriviaTZ();
  const openMin = timeToMinutes(wp.openTime);
  const closeMin = timeToMinutes(wp.closeTime);

  let status: WeekAvailabilityStatus;
  if (date < wp.availableDate || (date === wp.availableDate && minutes < openMin)) {
    status = 'before';
  } else if (date === wp.availableDate && minutes >= openMin && minutes <= closeMin) {
    status = 'open';
  } else {
    status = 'after';
  }

  return {
    available: status === 'open',
    availableDate: wp.availableDate,
    openTime: wp.openTime,
    closeTime: wp.closeTime,
    status,
    weekNumber: wp.weekNumber,
  };
}

/* ───────────── Public API ───────────── */

export function getWeek(weekNumber: number): WeeklyTrivia | undefined {
  const wp = weekPools.find((w) => w.weekNumber === weekNumber);
  if (!wp) return undefined;
  const questions = pickRandom(wp.pool, 3) as [Question, Question, Question];
  return {
    weekNumber: wp.weekNumber,
    title: wp.title,
    description: wp.description,
    questions,
  };
}

export function getCurrentWeek(): WeeklyTrivia {
  const wp = weekPools[0];
  const questions = pickRandom(wp.pool, 3) as [Question, Question, Question];
  return {
    weekNumber: wp.weekNumber,
    title: wp.title,
    description: wp.description,
    questions,
  };
}
