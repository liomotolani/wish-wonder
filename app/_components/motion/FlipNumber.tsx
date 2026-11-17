'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { rollSequence } from '@/lib/countdown';
import { COUNTDOWN, EASE_OUT, SPRING } from './presets';
import { SparkleStar } from './Sparkle';

export type FlipAnimation = 'pending' | 'roll' | 'flip' | 'fade' | 'static';

interface FlipNumberProps {
  value: number;
  className?: string;
  /** One accessible name for the board. The flap digits themselves are hidden. */
  label?: string;
  /**
   * pending: reserved space, waiting for the client to choose a mode.
   * roll: step through a few values, then land with a spring.
   * flip: a quick flip-in for later visits.
   * fade: a short opacity fade (reduced motion).
   * static: no entrance, just the digits.
   */
  animation?: FlipAnimation;
  /** Bloom and sparkle as the rolled digits land. */
  celebrate?: boolean;
  /** Extra sparkles after the quick flip, for the last couple of days. */
  flipSparkles?: boolean;
  sparkleCount?: number;
  onLanded?: () => void;
}

/** Where the landing sparkles sit, in pixels from the centre of the board. */
const SPARKLE_SPOTS = [
  { x: -34, y: -22, size: 11 },
  { x: 28, y: -30, size: 9 },
  { x: 40, y: 8, size: 12 },
  { x: -27, y: 25, size: 8 },
  { x: 6, y: -38, size: 7 },
  { x: -42, y: 4, size: 7 },
  { x: 20, y: 32, size: 9 },
] as const;

function rollSequenceFor(value: number): number[] {
  return rollSequence(value, COUNTDOWN.rollSteps);
}

/**
 * The split-flap board used by the Christmas countdown. Each digit is a card
 * with a top and bottom half and a thin seam. The card size is fixed in `em`,
 * and the figures are tabular, so nothing moves as digits change.
 */
export function FlipNumber({
  value,
  className = '',
  label,
  animation = 'static',
  celebrate = true,
  flipSparkles = false,
  sparkleCount = COUNTDOWN.sparkleCount,
  onLanded,
}: FlipNumberProps) {
  const reduce = useReducedMotion();
  const effective: FlipAnimation = reduce && animation === 'roll' ? 'fade' : animation;

  const [display, setDisplay] = useState(value);
  const [step, setStep] = useState(0);
  const [glowKey, setGlowKey] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [showGlow, setShowGlow] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const displayRef = useRef(value);
  const valueRef = useRef(value);
  const celebrateRef = useRef(celebrate);
  const flipSparklesRef = useRef(flipSparkles);
  const sparkleCountRef = useRef(sparkleCount);
  const onLandedRef = useRef(onLanded);
  const played = useRef(false);
  const rolling = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    valueRef.current = value;
    celebrateRef.current = celebrate;
    flipSparklesRef.current = flipSparkles;
    sparkleCountRef.current = sparkleCount;
    onLandedRef.current = onLanded;
  }, [value, celebrate, flipSparkles, sparkleCount, onLanded]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const later = useCallback((callback: () => void, delayMs: number) => {
    timers.current.push(window.setTimeout(callback, delayMs));
  }, []);

  const commit = useCallback((next: number) => {
    displayRef.current = next;
    setDisplay(next);
    setStep((current) => current + 1);
  }, []);

  const celebrateNow = useCallback(
    (delayMs = 0, withGlow = true) => {
      const count = sparkleCountRef.current;
      const sparkleLifeMs =
        (COUNTDOWN.sparkle + COUNTDOWN.sparkleStep * count + 0.15) * 1000;

      later(() => {
        if (withGlow) {
          setShowGlow(true);
          setGlowKey((key) => key + 1);
        }

        setShowSparkles(true);
        setSparkleKey((key) => key + 1);
      }, delayMs);

      if (withGlow) {
        later(() => setShowGlow(false), delayMs + COUNTDOWN.glow * 1000);
      }

      later(() => setShowSparkles(false), delayMs + sparkleLifeMs);
    },
    [later],
  );

  const startRoll = useCallback(() => {
    rolling.current = true;

    const sequence = rollSequenceFor(valueRef.current);
    const stepMs = COUNTDOWN.rollStep * 1000;
    const digitCount = String(valueRef.current).length;
    const landAtMs =
      (sequence.length - 1) * stepMs +
      (digitCount - 1) * COUNTDOWN.digitStagger * 1000;
    const glowAtMs = landAtMs + 120;

    sequence.forEach((next, index) => {
      if (index === 0) {
        commit(next);
        return;
      }

      later(() => commit(next), index * stepMs);
    });

    later(() => {
      rolling.current = false;
      onLandedRef.current?.();
    }, landAtMs + COUNTDOWN.settle * 1000);

    if (celebrateRef.current) {
      celebrateNow(glowAtMs);
    }
  }, [celebrateNow, commit, later]);

  useEffect(() => {
    clearTimers();

    if (effective === 'pending') {
      return;
    }

    if (!played.current) {
      played.current = true;

      if (effective === 'roll') {
        startRoll();
        return;
      }

      if (effective === 'flip' || effective === 'fade') {
        commit(valueRef.current);

        if (effective === 'flip' && flipSparklesRef.current) {
          celebrateNow(COUNTDOWN.quick * 1000, false);
        }
      }

      return;
    }

    // Reduced motion can switch on after the board has already dealt with a
    // mode; in that case settle on a quiet fade.
    if (effective === 'fade') {
      setShowGlow(false);
      setShowSparkles(false);
      commit(valueRef.current);
    }
  }, [celebrateNow, clearTimers, commit, effective, startRoll]);

  useEffect(() => {
    if (!played.current || rolling.current || displayRef.current === value) {
      return;
    }

    commit(value);
  }, [commit, value]);

  useEffect(() => clearTimers, [clearTimers]);

  const digits = String(display).split('');
  const landed = display === value;
  const fadeOnly = effective === 'fade' || Boolean(reduce);
  const hidden = effective === 'pending';

  return (
    <span
      className={`relative inline-flex ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {showGlow ? (
        <motion.span
          key={`glow-${glowKey}`}
          data-countdown-glow="true"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 rounded-full"
          style={{
            width: '4em',
            height: '4em',
            x: '-50%',
            y: '-50%',
            backgroundImage:
              'radial-gradient(circle, color-mix(in srgb, var(--color-gold) 65%, transparent) 0%, color-mix(in srgb, var(--color-gold) 32%, transparent) 42%, transparent 70%)',
          }}
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: [0, 0.75, 0.7, 0], scale: [0.8, 1.04, 1.04, 1.12] }}
          transition={{
            duration: COUNTDOWN.glow,
            times: [0, 0.22, 0.55, 1],
            ease: EASE_OUT,
          }}
        />
      ) : null}

      <span
        className="flip-number relative z-10 inline-flex items-center gap-[0.09em]"
        aria-hidden="true"
        style={{ perspective: 900 }}
      >
        {digits.map((digit, index) => {
          const delay = index * (landed ? COUNTDOWN.digitStagger : COUNTDOWN.quickStagger);
          const entering =
            effective === 'roll' && !landed
              ? { duration: 0.16, ease: EASE_OUT }
              : fadeOnly
                ? { duration: 0.2, ease: EASE_OUT }
                : { ...SPRING.pop, delay };

          return (
            <motion.span
              key={`${step}-${index}`}
              className="relative inline-flex h-[1.14em] w-[0.64em] items-center justify-center overflow-hidden rounded-[0.09em] bg-pine-700 text-snow shadow-[inset_0_0_0_1px_rgba(246,244,239,0.07)]"
              style={{ transformOrigin: '50% 50%' }}
              initial={
                hidden || fadeOnly
                  ? { opacity: 0 }
                  : { opacity: 0, rotateX: 90 }
              }
              animate={hidden ? { opacity: 0 } : { opacity: 1, rotateX: 0 }}
              transition={entering}
            >
              <span className="absolute inset-x-0 top-0 h-1/2 overflow-hidden">
                <span className="absolute inset-x-0 top-0 flex h-[200%] items-center justify-center tabular-nums">
                  {digit}
                </span>
              </span>
              <span className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden">
                <span className="absolute inset-x-0 bottom-0 flex h-[200%] items-center justify-center tabular-nums">
                  {digit}
                </span>
                <span className="pointer-events-none absolute inset-0 bg-pine-900/15" />
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-pine-900/90"
              />
            </motion.span>
          );
        })}
      </span>

      {showSparkles ? (
        <span
          key={`sparkles-${sparkleKey}`}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
        >
          {SPARKLE_SPOTS.slice(0, sparkleCount).map((spot, index) => (
            <motion.span
              key={index}
              data-countdown-sparkle="true"
              className="absolute top-1/2 left-1/2 text-gold"
              style={{
                width: spot.size,
                height: spot.size,
                marginLeft: -spot.size / 2,
                marginTop: -spot.size / 2,
                filter: 'drop-shadow(0 0 4px color-mix(in srgb, var(--color-gold) 60%, transparent))',
              }}
              initial={{ opacity: 0, scale: 0.2, x: 0, y: 0, rotate: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.2, 1, 0.2],
                x: spot.x,
                y: spot.y,
                rotate: index % 2 === 0 ? 90 : -90,
              }}
              transition={{
                duration: COUNTDOWN.sparkle,
                delay: index * COUNTDOWN.sparkleStep,
                ease: EASE_OUT,
              }}
            >
              <SparkleStar className="h-full w-full" />
            </motion.span>
          ))}
        </span>
      ) : null}
    </span>
  );
}
