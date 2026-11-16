'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useAnimationControls,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from 'motion/react';
import { DURATION, EASE_OUT, EASE_SOFT } from './presets';

interface RevealSceneProps {
  number: number;
  children: ReactNode;
}

/**
 * The gift-opening sequence: the box wiggles, the lid lifts and tilts off, a
 * soft gold glow blooms, then the gift card slides up. Tapping skips to the end.
 */
export function RevealScene({ number, children }: RevealSceneProps) {
  const reduce = useReducedMotion();
  const box = useAnimationControls();
  const lid = useAnimationControls();
  const glow = useAnimationControls();
  const heading = useAnimationControls();
  const card = useAnimationControls();
  const [settled, setSettled] = useState(false);
  const timers = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    box.stop();
    lid.stop();
    glow.stop();
    heading.stop();
    card.stop();

    box.set({ opacity: 1, scale: 1, rotate: 0 });
    lid.set({ opacity: 0, y: -90, rotate: -22, scale: 1.04 });
    glow.set({ opacity: 0.48, scale: 1 });
    heading.set({ opacity: 1, y: 0 });
    card.set({ opacity: 1, y: 0 });
    setSettled(true);
  }, [box, card, clearTimers, glow, heading, lid]);

  useIsomorphicLayoutEffect(() => {
    // Start hidden, before the first paint, so there is no flash of the end state.
    box.set({ opacity: 1, scale: 1, rotate: 0 });
    lid.set({ opacity: 1, y: 0, rotate: 0, scale: 1 });
    glow.set({ opacity: 0, scale: 0.55 });
    heading.set({ opacity: 0, y: 16 });
    card.set({ opacity: 1, y: 48 });

    if (reduce) {
      lid.set({ opacity: 0, y: -90, rotate: -22 });
      glow.set({ opacity: 0.48, scale: 1 });
      void heading.start({ opacity: 1, y: 0 }, { duration: DURATION.feedback });
      void card.start({ opacity: 1, y: 0 }, { duration: DURATION.feedback });
      const settle = window.setTimeout(() => setSettled(true), DURATION.feedback * 1000);
      timers.current.push(settle);
      return () => clearTimers();
    }

    const { lead, wiggle, lid: lidTime, glow: glowTime, heading: headingTime, card: cardTime } =
      DURATION.reveal;

    void box.start(
      { rotate: [0, -2.5, 2.5, -1, 0], scale: [1, 1.045, 1.02, 1] },
      { duration: wiggle, ease: EASE_SOFT, delay: lead },
    );
    void lid.start(
      {
        y: [0, -12, -90],
        rotate: [0, -4, -22],
        opacity: [1, 1, 0],
        scale: [1, 1.02, 1.04],
      },
      { duration: lidTime, ease: EASE_OUT, delay: lead + 0.08 },
    );
    void glow.start(
      { opacity: [0, 0.9, 0.48], scale: [0.55, 1.05, 1] },
      { duration: glowTime, ease: EASE_OUT, delay: lead },
    );
    void heading.start(
      { opacity: [0, 1], y: [16, 0] },
      {
        duration: headingTime,
        ease: EASE_OUT,
        delay: lead + DURATION.reveal.headingDelay,
      },
    );
    void card.start(
      { opacity: [1, 1], y: [48, 0] },
      { duration: cardTime, ease: EASE_OUT, delay: lead + DURATION.reveal.cardDelay },
    );

    const settle = window.setTimeout(finish, DURATION.reveal.total * 1000);
    timers.current.push(settle);

    return () => clearTimers();
  }, [box, card, clearTimers, finish, glow, heading, lid, reduce]);

  function skip(event: React.PointerEvent<HTMLDivElement>) {
    if (settled) {
      return;
    }

    const target = event.target as Element;

    // Let real controls (buttons and links) behave normally.
    if (target.closest('a, button, input, select, textarea')) {
      return;
    }

    finish();
  }

  return (
    <div onPointerDown={skip}>
      <div className="mx-auto max-w-md text-center lg:hidden">
        <div
          className="relative mx-auto h-56 w-56 sm:h-64 sm:w-64"
          aria-hidden="true"
        >
          <motion.span
            animate={glow}
            style={{ opacity: 0 }}
            className="reveal-glow-surface reveal-prestart absolute inset-[8%] rounded-full"
          />
          <span className="absolute inset-[12%] rounded-full border border-gold/40" />

          <motion.div
            animate={box}
            style={{ x: '-50%' }}
            className="absolute bottom-2 left-1/2 h-32 w-32 sm:h-36 sm:w-36"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[24px] bg-cranberry shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
              <span className="absolute inset-y-0 left-1/2 w-2.5 -translate-x-1/2 bg-gold" />
              <span className="absolute inset-x-0 top-[34%] h-2.5 bg-gold" />
              <span className="absolute bottom-3 left-4 text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                {number}
              </span>
            </div>

            <motion.div
              animate={lid}
              style={{ transformOrigin: '50% 100%' }}
              className="absolute bottom-[calc(100%-0.65rem)] left-[-5%] w-[110%]"
            >
              <div className="relative h-10 rounded-[10px] bg-cranberry shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
                <span className="absolute inset-y-0 left-1/2 w-2.5 -translate-x-1/2 bg-gold" />
              </div>
              <svg
                className="absolute bottom-full left-1/2 mb-[-0.35rem] h-14 w-14 -translate-x-1/2 text-gold"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9C9.5 4.5 4 6 6.5 10.5 8 13 12 12.5 12 12.5s4 .5 5.5-2C20 6 14.5 4.5 12 9Z" />
                <path d="M12 9v6" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        <motion.h1
          animate={heading}
          style={{ opacity: 0 }}
          className="reveal-prestart mt-2 text-4xl font-extrabold leading-tight tracking-tight"
        >
          Mystery gift revealed
        </motion.h1>
      </div>

      <motion.div
        animate={card}
        style={{ opacity: 0 }}
        className="reveal-prestart mt-7 lg:mt-10 lg:flex lg:justify-center"
      >
        {children}
      </motion.div>
    </div>
  );
}
