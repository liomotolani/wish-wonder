'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  daysUntilChristmas,
  londonDateKey,
  msUntilNextLondonMidnight,
} from '@/lib/dates';
import {
  countdownAccessibleLabel,
  countdownLabel,
  countdownMilestone,
} from '@/lib/countdown';
import { FlipNumber, type FlipAnimation } from './FlipNumber';
import { fireChristmasDayConfetti } from './celebration';
import { COUNTDOWN } from './presets';

const ROLLED_TODAY_KEY = 'ww-countdown-rolled';
const CONFETTI_TODAY_KEY = 'ww-countdown-confetti';

/**
 * The family dashboard countdown. The board rolls once a day, flips quietly on
 * later visits, and ticks over at London midnight. Milestones add a line of
 * copy, and Christmas Day gets one confetti burst per device per day.
 */
export function ChristmasCountdown({ initialDays }: { initialDays: number }) {
  const reduce = useReducedMotion();
  const [days, setDays] = useState(initialDays);
  const [mode, setMode] = useState<FlipAnimation>('pending');

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (reduce) {
        setMode('fade');
        return;
      }

      const today = londonDateKey();
      let shouldRoll = false;

      try {
        shouldRoll = window.localStorage.getItem(ROLLED_TODAY_KEY) !== today;

        if (shouldRoll) {
          window.localStorage.setItem(ROLLED_TODAY_KEY, today);
        }
      } catch {
        // Private browsing or a full disk: still give them the roll.
        shouldRoll = true;
      }

      setMode(shouldRoll ? 'roll' : 'flip');
    });

    return () => window.cancelAnimationFrame(frame);
  }, [reduce]);

  // Flip down by one when the London calendar day turns over.
  useEffect(() => {
    let timer = 0;

    function schedule() {
      timer = window.setTimeout(() => {
        setDays(daysUntilChristmas());
        schedule();
      }, Math.max(1000, msUntilNextLondonMidnight() + 300));
    }

    schedule();

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (reduce || days !== 0 || mode === 'pending') {
      return;
    }

    const today = londonDateKey();

    try {
      if (window.localStorage.getItem(CONFETTI_TODAY_KEY) === today) {
        return;
      }

      window.localStorage.setItem(CONFETTI_TODAY_KEY, today);
    } catch {
      // Without storage a reload may celebrate again; the day is still special.
    }

    const timer = window.setTimeout(
      () => {
        void fireChristmasDayConfetti();
      },
      mode === 'roll' ? 900 : 420,
    );

    return () => window.clearTimeout(timer);
  }, [days, mode, reduce]);

  const milestone = countdownMilestone(days);

  return (
    <div>
      <p
        className="flex items-end gap-3"
        role="group"
        aria-label={countdownAccessibleLabel(days)}
      >
        <FlipNumber
          value={days}
          animation={mode}
          flipSparkles={days <= 1}
          sparkleCount={
            days <= 1 ? COUNTDOWN.sparkleExtraCount : COUNTDOWN.sparkleCount
          }
          className="text-6xl font-extrabold leading-none tracking-[-0.05em] text-snow sm:text-7xl"
        />
        <span
          aria-hidden="true"
          className="max-w-[9rem] pb-1 text-base leading-tight text-snow/65 sm:text-lg"
        >
          {countdownLabel(days)}
        </span>
      </p>

      {milestone ? (
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-gold">
          {milestone}
        </p>
      ) : null}
    </div>
  );
}
