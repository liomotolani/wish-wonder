'use client';

import { CONFETTI } from './presets';

interface Origin {
  x: number;
  y: number;
}

function readColours(): string[] {
  const styles = getComputedStyle(document.documentElement);

  return CONFETTI.colorVars.map((name) => styles.getPropertyValue(name).trim()).filter(
    Boolean,
  );
}

/**
 * A short cranberry, gold, white and pine burst. canvas-confetti is loaded
 * only when someone actually claims a gift. Reduced motion disables it.
 */
export async function fireClaimConfetti(
  origin: Origin,
  isCancelled: () => boolean = () => false,
): Promise<void> {
  const { default: confetti } = await import('canvas-confetti');

  if (isCancelled()) {
    return;
  }

  const colors = readColours();

  confetti({
    particleCount: CONFETTI.count,
    spread: CONFETTI.spread,
    startVelocity: CONFETTI.startVelocity,
    gravity: CONFETTI.gravity,
    ticks: CONFETTI.ticks,
    scalar: CONFETTI.scalar,
    origin,
    colors,
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
      origin: { x: origin.x, y: origin.y - 0.08 },
      colors,
      disableForReducedMotion: true,
    });
  }, CONFETTI.secondWaveDelayMs);
}
