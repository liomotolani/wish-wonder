'use client';

import { memo, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  motion,
  useAnimationControls,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from 'motion/react';
import { DURATION, EASE_IN_OUT, EASE_OUT, SPARKLE, SPRING } from './presets';
import { SnowflakeMark, SparkleStar } from './Sparkle';
import { useIsLaptop } from './useMediaQuery';
import { mysteryToneFor } from '@/lib/mystery-tone';

interface RevealSceneProps {
  number: number;
  children: ReactNode;
}

const INTERACTIVE = 'a, button, input, select, textarea';

function isInteractive(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE));
}

function seeded(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

/**
 * Snowflakes, gold stars and a few dots that fan up out of the box as the lid
 * leaves, and out from behind the gift card on a laptop. Deterministic angles
 * keep the server and client markup identical.
 */
function SparkleBurst({
  origin = 'top-[40%]',
  scale = 1,
}: {
  origin?: string;
  scale?: number;
}) {
  const step = SPARKLE.sweep / (SPARKLE.count - 1);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10">
      {Array.from({ length: SPARKLE.count }, (_, index) => {
        const kind =
          index % 3 === 0 ? 'star' : index % 3 === 1 ? 'snowflake' : 'dot';
        // A little angle jitter keeps the fan from looking like a clock face.
        const angleJitter = (seeded(index + 53) - 0.5) * step * 0.6;
        const angle =
          ((SPARKLE.startAngle + index * step + angleJitter) * Math.PI) / 180;
        const jitter =
          1 - SPARKLE.distanceJitter / 2 + seeded(index + 5) * SPARKLE.distanceJitter;
        const distance = SPARKLE.distance * jitter * scale;
        const size =
          kind === 'star'
            ? SPARKLE.starSize
            : kind === 'snowflake'
              ? SPARKLE.snowflakeSize
              : SPARKLE.dotSize;
        const delay =
          DURATION.reveal.lead +
          DURATION.reveal.sparkleDelay +
          index * DURATION.sparkleStep;

        return (
          <motion.span
            key={index}
            data-sparkle={kind}
            className={`absolute left-1/2 ${origin} ${
              kind === 'star'
                ? 'text-gold'
                : kind === 'snowflake'
                  ? 'text-snow'
                  : index % 2 === 0
                    ? 'bg-gold'
                    : 'bg-snow'
            }`}
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              borderRadius: kind === 'dot' ? '9999px' : undefined,
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0.3, 1, 0.4],
              rotate: kind === 'star' ? [-30, 30] : kind === 'snowflake' ? [0, 120] : 0,
            }}
            transition={{ duration: DURATION.sparkle, ease: EASE_OUT, delay }}
          >
            {kind === 'star' ? (
              <SparkleStar className="h-full w-full" />
            ) : kind === 'snowflake' ? (
              <SnowflakeMark className="h-full w-full" />
            ) : null}
          </motion.span>
        );
      })}
    </div>
  );
}

/** Memoised so a settle fades the layer without restarting its sparks. */
const SparkleLayer = memo(SparkleBurst);

/**
 * The gift-opening sequence: the box jingles, the bow spins off, the ribbon
 * bands slide away, the lid springs off with a bounce, snowflakes and gold
 * stars burst out, then the gift card springs up. A short tap (or Escape)
 * skips to the end.
 */
export function RevealScene({ number, children }: RevealSceneProps) {
  const reduce = useReducedMotion();
  const laptop = useIsLaptop();
  const tone = mysteryToneFor(number);
  const box = useAnimationControls();
  const bow = useAnimationControls();
  const ribbonVertical = useAnimationControls();
  const ribbonHorizontal = useAnimationControls();
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
    bow.stop();
    ribbonVertical.stop();
    ribbonHorizontal.stop();
    lid.stop();
    glow.stop();
    heading.stop();
    card.stop();

    if (reduce) {
      box.set({ opacity: 1, scale: 1, rotate: 0 });
      bow.set({ opacity: 0, y: -44, rotate: 360, scale: 0.5 });
      ribbonVertical.set({ y: '110%', opacity: 0 });
      ribbonHorizontal.set({ x: '110%', opacity: 0 });
      lid.set({ opacity: 0, y: -84, rotate: -18, scale: 1.04 });
      glow.set({ opacity: 0.5, scale: 1 });
      heading.set({ opacity: 1, y: 0 });
      card.set({ opacity: 1, y: 0 });
    } else {
      // Skipping early should still land softly rather than jump to the end.
      const settle = { duration: DURATION.reveal.settle, ease: EASE_OUT };
      void box.start({ opacity: 1, scale: 1, rotate: 0 }, settle);
      void bow.start({ opacity: 0, y: -44, rotate: 360, scale: 0.5 }, settle);
      void ribbonVertical.start({ y: '110%', opacity: 0 }, settle);
      void ribbonHorizontal.start({ x: '110%', opacity: 0 }, settle);
      void lid.start({ opacity: 0, y: -84, rotate: -18, scale: 1.04 }, settle);
      void glow.start({ opacity: 0.5, scale: 1 }, settle);
      void heading.start({ opacity: 1, y: 0 }, settle);
      void card.start({ opacity: 1, y: 0 }, settle);
    }

    setSettled(true);
  }, [
    box,
    bow,
    card,
    clearTimers,
    glow,
    heading,
    lid,
    reduce,
    ribbonHorizontal,
    ribbonVertical,
  ]);

  useIsomorphicLayoutEffect(() => {
    // Start hidden, before the first paint, so there is no flash of the end state.
    box.set({ opacity: 1, scale: 1, rotate: 0 });
    bow.set({ opacity: 1, y: 0, rotate: 0, scale: 1 });
    ribbonVertical.set({ y: 0, opacity: 1 });
    ribbonHorizontal.set({ x: 0, opacity: 1 });
    lid.set({ opacity: 1, y: 0, rotate: 0, scale: 1 });
    glow.set({ opacity: 0, scale: 0.6 });
    heading.set({ opacity: 0, y: 8 });
    card.set({ opacity: 0, y: 20 });

    if (reduce) {
      bow.set({ opacity: 0, y: -44, rotate: 360, scale: 0.5 });
      ribbonVertical.set({ y: '110%', opacity: 0 });
      ribbonHorizontal.set({ x: '110%', opacity: 0 });
      lid.set({ opacity: 0, y: -84, rotate: -18, scale: 1.04 });
      glow.set({ opacity: 0.5, scale: 1 });
      heading.set({ y: 0 });
      card.set({ y: 0 });
      const fade = { duration: DURATION.feedback, ease: EASE_OUT };
      void heading.start({ opacity: 1 }, fade);
      void card.start({ opacity: 1 }, fade);
      const settle = window.setTimeout(() => setSettled(true), DURATION.feedback * 1000);
      timers.current.push(settle);
      return () => clearTimers();
    }

    const {
      lead,
      wiggle,
      bowDelay,
      ribbonDelay,
      lidDelay,
      glow: glowTime,
      headingDelay,
      cardDelay,
    } = DURATION.reveal;

    void box.start(
      { rotate: [0, -6, 6, -3, 0], scale: [1, 1.04, 1.01, 1] },
      { duration: wiggle, ease: EASE_IN_OUT, delay: lead },
    );
    void bow.start(
      { y: -44, rotate: 360, scale: 0.5, opacity: 0 },
      { ...SPRING.pop, delay: lead + bowDelay },
    );
    void ribbonVertical.start(
      { y: '110%', opacity: 0 },
      { duration: DURATION.feedback, ease: EASE_OUT, delay: lead + ribbonDelay },
    );
    void ribbonHorizontal.start(
      { x: '110%', opacity: 0 },
      { duration: DURATION.feedback, ease: EASE_OUT, delay: lead + ribbonDelay },
    );
    void lid.start(
      { y: -84, rotate: -18, scale: 1.04, opacity: 0 },
      { ...SPRING.pop, delay: lead + lidDelay },
    );
    void glow.start(
      { opacity: [0, 0.5], scale: [0.6, 1] },
      { duration: glowTime, ease: EASE_OUT, delay: lead },
    );
    void heading.start(
      { opacity: 1, y: 0 },
      { ...SPRING.pop, delay: lead + headingDelay },
    );
    void card.start(
      { opacity: 1, y: 0 },
      { ...SPRING.pop, delay: lead + cardDelay },
    );

    const settle = window.setTimeout(finish, DURATION.reveal.total * 1000);
    timers.current.push(settle);

    return () => clearTimers();
  }, [
    box,
    bow,
    card,
    clearTimers,
    finish,
    glow,
    heading,
    lid,
    reduce,
    ribbonHorizontal,
    ribbonVertical,
  ]);

  const tapStart = useRef<{ x: number; y: number; at: number } | null>(null);

  useEffect(() => {
    if (settled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        finish();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finish, settled]);

  function rememberTap(event: React.PointerEvent<HTMLDivElement>) {
    if (settled || event.button !== 0 || isInteractive(event.target)) {
      tapStart.current = null;
      return;
    }

    tapStart.current = {
      x: event.clientX,
      y: event.clientY,
      at: performance.now(),
    };
  }

  function maybeFinish(event: React.PointerEvent<HTMLDivElement>) {
    const start = tapStart.current;
    tapStart.current = null;

    if (!start || settled || isInteractive(event.target)) {
      return;
    }

    const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);

    // A scroll starts with the same pointer events as a tap. Only a short,
    // still press skips, so reading or scrolling never cuts the reveal.
    if (moved <= 12 && performance.now() - start.at <= 600) {
      finish();
    }
  }

  function cancelTap() {
    tapStart.current = null;
  }

  return (
    <div
      data-reveal-scene
      onPointerDown={rememberTap}
      onPointerUp={maybeFinish}
      onPointerCancel={cancelTap}
    >
      <div className="mx-auto max-w-md text-center lg:hidden">
        <div className="relative mx-auto h-56 w-56 sm:h-64 sm:w-64" aria-hidden="true">
          <motion.span
            animate={glow}
            style={{ opacity: 0 }}
            className="reveal-glow-surface reveal-prestart absolute inset-[8%] rounded-full"
          />
          <span className="absolute inset-[12%] rounded-full border border-gold/40" />

          {!reduce && !laptop ? (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-150 ${
                settled ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <SparkleLayer />
            </div>
          ) : null}

          <motion.div
            animate={box}
            style={{ x: '-50%' }}
            className="absolute bottom-2 left-1/2 h-32 w-32 sm:h-36 sm:w-36"
          >
            <div
              className={`absolute inset-0 overflow-hidden rounded-[24px] ${tone.box} shadow-[0_24px_50px_rgba(0,0,0,0.35)]`}
            >
              <motion.span
                animate={ribbonVertical}
                className={`absolute inset-y-0 left-1/2 w-2.5 ${tone.ribbon}`}
                style={{ marginLeft: -5 }}
              />
              <motion.span
                animate={ribbonHorizontal}
                className={`absolute inset-x-0 top-[34%] h-2.5 ${tone.ribbon}`}
              />
              <span
                className={`absolute bottom-3 left-4 text-5xl font-extrabold tracking-tight sm:text-6xl ${tone.number}`}
              >
                {number}
              </span>
              {!reduce ? (
                <motion.span
                  data-glint="reveal"
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-[-20%] left-0 w-1/3"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
                  }}
                  initial={{ x: '-180%', opacity: 0, rotate: 12 }}
                  animate={{ x: '480%', opacity: [0, 0.55, 0], rotate: 12 }}
                  transition={{
                    duration: DURATION.glint,
                    ease: EASE_IN_OUT,
                    delay: DURATION.reveal.lead + 0.04,
                  }}
                />
              ) : null}
            </div>

            <motion.div
              animate={lid}
              style={{ transformOrigin: '50% 100%' }}
              className="absolute bottom-[calc(100%-0.65rem)] left-[-5%] w-[110%]"
            >
              <div
                className={`relative h-10 rounded-[10px] ${tone.box} shadow-[0_10px_20px_rgba(0,0,0,0.25)]`}
              >
                <span
                  className={`absolute inset-y-0 left-1/2 w-2.5 -translate-x-1/2 ${tone.ribbon}`}
                />
              </div>
            </motion.div>

            <motion.span
              animate={bow}
              aria-hidden="true"
              className={`absolute bottom-[calc(100%+1.5rem)] left-1/2 h-14 w-14 ${tone.bow}`}
              style={{ marginLeft: -28, transformOrigin: '50% 50%' }}
            >
              <svg
                className="h-full w-full"
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
            </motion.span>
          </motion.div>
        </div>

        <motion.h1
          animate={heading}
          style={{ opacity: 0 }}
          className="reveal-prestart mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
        >
          Mystery gift revealed
        </motion.h1>
      </div>

      <div className="relative mt-7 lg:mt-10">
        {!reduce && laptop ? (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-0 -top-20 z-20 h-20 transition-opacity duration-150 ${
              settled ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <SparkleLayer origin="top-full" scale={0.75} />
          </div>
        ) : null}
        <motion.div
          animate={card}
          style={{ opacity: 0 }}
          className="reveal-prestart lg:flex lg:justify-center"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
