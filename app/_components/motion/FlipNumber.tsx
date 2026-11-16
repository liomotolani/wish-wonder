'use client';

import { motion, useReducedMotion } from 'motion/react';
import { DURATION, EASE_OUT, SPRING } from './presets';

interface FlipNumberProps {
  value: number;
  className?: string;
}

/**
 * A split-flap style entrance: each digit flips down into place, with a small
 * stagger. Reduced motion gets a simple fade.
 */
export function FlipNumber({ value, className = '' }: FlipNumberProps) {
  const reduce = useReducedMotion();
  const characters = String(value).split('');

  return (
    <span className={`flip-number inline-flex ${className}`} style={{ perspective: 600 }}>
      {characters.map((character, index) => (
        <motion.span
          key={`${index}-${character}`}
          className="inline-block"
          style={{ transformOrigin: '50% 50%' }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotateX: 90 }}
          animate={{ opacity: 1, rotateX: 0 }}
          transition={
            reduce
              ? { duration: DURATION.feedback, ease: EASE_OUT }
              : { ...SPRING.pop, delay: index * 0.04 }
          }
        >
          {character}
        </motion.span>
      ))}
    </span>
  );
}
