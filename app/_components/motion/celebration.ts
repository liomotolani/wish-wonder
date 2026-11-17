'use client';

import { CONFETTI, COUNTDOWN } from './presets';

interface Origin {
  x: number;
  y: number;
}

/** A 24x24 five-point star and six-point snowflake, scaled to 10px by canvas. */
const STAR_PATH =
  'M12 1.5 14.8 8.6 22.4 9.2 16.5 13.9 18.4 21.2 12 17 5.6 21.2 7.5 13.9 1.6 9.2 9.2 8.6Z';
const SNOWFLAKE_PATH =
  'M12 1 14.25 8.1 21.5 6.5 16.5 12 21.5 17.5 14.25 15.9 12 23 9.75 15.9 2.5 17.5 7.5 12 2.5 6.5 9.75 8.1Z';

type ConfettiFunction = typeof import('canvas-confetti');
type ConfettiModule = { default: ConfettiFunction };

let confettiModule: Promise<ConfettiModule> | null = null;

function loadConfetti(): Promise<ConfettiModule> {
  confettiModule ??= import('canvas-confetti');
  return confettiModule;
}

/** Warm the confetti module while the reveal is on screen. */
export function preloadClaimConfetti(): void {
  void loadConfetti().catch(() => {
    // The claim still works if the celebration module cannot load.
  });
}

function readColours(names: readonly string[]): string[] {
  const styles = getComputedStyle(document.documentElement);

  return names.map((name) => styles.getPropertyValue(name).trim()).filter(Boolean);
}

function makeShape(
  confetti: ConfettiFunction,
  path: string,
  fallback: 'star' | 'circle',
) {
  try {
    // Supplying the matrix skips canvas-confetti's slow path scan.
    const scale = 10 / 24;
    const matrix = new DOMMatrix([scale, 0, 0, scale, -5, -5]);

    return confetti.shapeFromPath({ path, matrix });
  } catch {
    return fallback;
  }
}

/**
 * One burst of snowflakes and gold stars for Christmas Day, fired at most once
 * per day by the countdown. Reduced motion disables it.
 */
export async function fireChristmasDayConfetti(): Promise<void> {
  const { default: confetti } = await loadConfetti();
  const starShape = makeShape(confetti, STAR_PATH, 'star');
  const snowflakeShape = makeShape(confetti, SNOWFLAKE_PATH, 'circle');
  const colors = readColours(CONFETTI.goldColorVars);

  confetti({
    particleCount: COUNTDOWN.confetti.count,
    spread: COUNTDOWN.confetti.spread,
    startVelocity: COUNTDOWN.confetti.startVelocity,
    gravity: COUNTDOWN.confetti.gravity,
    ticks: COUNTDOWN.confetti.ticks,
    scalar: COUNTDOWN.confetti.scalar,
    shapes: [starShape, snowflakeShape],
    colors,
    origin: { x: 0.5, y: 0.4 },
    disableForReducedMotion: true,
  });
}

/**
 * A short paper burst with a gold-and-white star and snowflake flourish.
 * canvas-confetti is loaded only when someone actually claims a gift.
 * Reduced motion disables it.
 */
export async function fireClaimConfetti(
  origin: Origin,
  isCancelled: () => boolean = () => false,
): Promise<void> {
  const { default: confetti } = await loadConfetti();

  if (isCancelled()) {
    return;
  }

  const starShape = makeShape(confetti, STAR_PATH, 'star');
  const snowflakeShape = makeShape(confetti, SNOWFLAKE_PATH, 'circle');
  const paperColors = readColours(CONFETTI.paperColorVars);
  const goldColors = readColours(CONFETTI.goldColorVars);

  confetti({
    particleCount: CONFETTI.count,
    spread: CONFETTI.spread,
    startVelocity: CONFETTI.startVelocity,
    gravity: CONFETTI.gravity,
    ticks: CONFETTI.ticks,
    scalar: CONFETTI.scalar,
    shapes: [...CONFETTI.paperShapes],
    origin,
    colors: paperColors,
    disableForReducedMotion: true,
  });

  window.setTimeout(() => {
    if (isCancelled()) {
      return;
    }

    confetti({
      particleCount: CONFETTI.secondWaveCount,
      spread: CONFETTI.spread * 1.4,
      startVelocity: CONFETTI.startVelocity * 0.8,
      gravity: CONFETTI.gravity,
      ticks: CONFETTI.ticks,
      scalar: CONFETTI.scalar,
      shapes: [...CONFETTI.paperShapes],
      origin: { x: origin.x, y: origin.y - 0.08 },
      colors: paperColors,
      disableForReducedMotion: true,
    });
  }, CONFETTI.secondWaveDelayMs);

  // Gold and white stars and snowflakes on top of the paper pieces.
  window.setTimeout(() => {
    if (isCancelled()) {
      return;
    }

    confetti({
      particleCount: CONFETTI.starCount,
      spread: CONFETTI.starSpread,
      startVelocity: CONFETTI.starVelocity,
      gravity: CONFETTI.starGravity,
      ticks: CONFETTI.ticks,
      scalar: CONFETTI.starScalar,
      shapes: [starShape, snowflakeShape],
      origin: { x: origin.x, y: origin.y - 0.12 },
      colors: goldColors,
      disableForReducedMotion: true,
    });
  }, CONFETTI.starDelayMs);
}
