'use client';

import { useEffect } from 'react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { EASE_IN_OUT, EASE_OUT } from '@/app/_components/motion/presets';
import { useMediaQuery } from '@/app/_components/motion/useMediaQuery';

const TONES = ['rose', 'mint', 'gold'] as const;

type BaubleTone = (typeof TONES)[number];

interface BaubleProps {
  name: string;
  className?: string;
}

function toneForName(name: string): BaubleTone {
  const first = name.charCodeAt(0) || 0;
  return TONES[first % TONES.length];
}

const TONE_STYLES: Record<BaubleTone, string> = {
  rose: 'bg-cranberry/15 text-cranberry-ink',
  mint: 'bg-pine-100 text-pine-700',
  gold: 'bg-gold-100 text-gold-ink',
};

export function Bauble({ name, className = '' }: BaubleProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  const reduce = useReducedMotion();
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const controls = useAnimationControls();

  useEffect(() => {
    if (reduce) {
      return;
    }

    // A single welcome swing, nudged apart so a dashboard of baubles is not
    // perfectly synchronised.
    const delay = 0.05 + ((name.charCodeAt(0) || 0) % 4) * 0.04;
    void controls.start(
      { rotate: [0, 3.5, -3.5, 0] },
      { duration: 0.5, ease: EASE_IN_OUT, delay },
    );
  }, [controls, name, reduce]);

  function handleHoverStart() {
    if (reduce || !finePointer) {
      return;
    }

    void controls.start(
      { rotate: [0, 4, -4, 4, 0] },
      { duration: 0.5, ease: EASE_IN_OUT },
    );
  }

  function handleHoverEnd() {
    if (reduce || !finePointer) {
      return;
    }

    void controls.start({ rotate: 0 }, { duration: 0.3, ease: EASE_OUT });
  }

  return (
    <span
      className={`inline-flex flex-col items-center ${className}`}
      aria-hidden="true"
    >
      <motion.span
        className="inline-flex flex-col items-center"
        animate={controls}
        onHoverStart={handleHoverStart}
        onHoverEnd={handleHoverEnd}
        style={{ transformOrigin: '50% 0%' }}
      >
        <span className="mb-0.5 h-1.5 w-3 rounded-[2px] bg-gold" />
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-extrabold ${TONE_STYLES[toneForName(name)]}`}
        >
          {initial}
        </span>
      </motion.span>
    </span>
  );
}
