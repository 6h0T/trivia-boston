'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';

export default function PremiosPopup() {
  const [open, setOpen] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const panelVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.92, y: 12 },
        visible: { opacity: 1, scale: 1, y: 0 },
      };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="premios-popup"
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="¡Podés ganarte estos premios!"
        >
          <motion.div
            className="absolute inset-0 bg-white/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <motion.div
            className="relative w-full max-w-[289px]"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={
              prefersReducedMotion
                ? { duration: 0.1 }
                : { type: 'spring', damping: 24, stiffness: 280 }
            }
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-on-surface shadow-lg ring-1 ring-black/10 transition hover:scale-105 active:scale-95"
            >
              <X className="h-5 w-5" strokeWidth={2.5} />
            </button>

            <div className="overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <Image
                src="/premios.png"
                alt="¡Podés ganarte estos premios!"
                width={1080}
                height={1920}
                priority
                className="h-auto w-full select-none"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
