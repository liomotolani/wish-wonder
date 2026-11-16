import type { Transition, Variants } from 'motion/react';

/**
 * The single source of truth for motion in Wish & Wonder.
 * Components must take timings, easings, springs and variants from here.
 * Only transform and opacity are animated.
 */

type Bezier = [number, number, number, number];

export const EASE_OUT: Bezier = [0.2, 0.9, 0.3, 1];
export const EASE_IN_OUT: Bezier = [0.65, 0, 0.35, 1];

export const DURATION = {
  /** A quick state change: toasts, fades, list items. */
  feedback: 0.2,
  /** A list item settling into place. */
  list: 0.18,
  /** Delay between list items. */
  stagger: 0.03,
  /** Only the first eight items stagger; the rest arrive together. */
  staggerMax: 8,
  /** The one-off gold outline pulse on a Peeked box. */
  peekPulse: 0.6,
  peekPulseStep: 0.05,
  /** The jingle-bell shake on a tapped mystery box. */
  tileShake: 0.2,
  /** The wrapping-paper sheen that crosses a tile on hover. */
  glint: 0.45,
  /** One sparkle in the reveal burst. */
  sparkle: 0.35,
  /** Delay between reveal sparkles. */
  sparkleStep: 0.01,
  reveal: {
    /** A tiny beat to register the closed box before it moves. */
    lead: 0.05,
    /** The box wobble. */
    wiggle: 0.25,
    /** The bow starts spinning after the wiggle. */
    bowDelay: 0.1,
    /** The ribbon bands slide away once the bow has popped. */
    ribbonDelay: 0.16,
    /** The lid springs off after the ribbons. */
    lidDelay: 0.23,
    /** Nominal settle for the lid spring. */
    lid: 0.35,
    /** The gold glow blooming behind the box. */
    glow: 0.4,
    headingDelay: 0.2,
    /** The gift card starts 0.3s after the scene mounts. */
    cardDelay: 0.25,
    /** Nominal settle for the card spring. */
    card: 0.35,
    /** Snowflakes and gold stars start as the lid leaves. */
    sparkleDelay: 0.25,
    /** A short settle when the animation is skipped early. */
    settle: 0.16,
    /** The whole scene is at rest by 0.8s. */
    total: 0.8,
  },
} as const;

/**
 * The house spring: a small, lively bounce that settles in about 0.35s.
 * Use it for anything that moves, pops or springs into place.
 */
export const SPRING = {
  pop: { type: 'spring', stiffness: 420, damping: 26 },
} satisfies Record<string, Transition>;

export const TRANSITION = {
  feedback: { duration: DURATION.feedback, ease: EASE_OUT },
  list: { duration: DURATION.list, ease: EASE_OUT },
} satisfies Record<string, Transition>;

export const PRESS = {
  scale: 0.97,
  hoverLift: -2,
} as const;

export const STAGGER = {
  delayChildren: 0.02,
  staggerChildren: DURATION.stagger,
  maxChildren: DURATION.staggerMax,
} as const;

export const LIST_CONTAINER: Variants = {
  hidden: {},
  visible: {},
};

/**
 * The delay is capped at the eighth item, so a long list arrives promptly
 * instead of keeping the user waiting for the tail.
 */
export const LIST_ITEM: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (index: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...TRANSITION.list,
      delay:
        STAGGER.delayChildren +
        Math.min(index, STAGGER.maxChildren - 1) * STAGGER.staggerChildren,
    },
  }),
};

export const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: TRANSITION.feedback },
};

export const FADE_IN: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITION.feedback },
};

/**
 * The sheen that crosses a gift tile on hover. It resets instantly so leaving
 * and re-entering sweeps the same way every time.
 */
export const GLINT: Variants = {
  rest: { x: '-160%', opacity: 0, rotate: -12, transition: { duration: 0 } },
  hover: {
    x: '460%',
    opacity: [0, 0.55, 0],
    rotate: -12,
    transition: { duration: DURATION.glint, ease: EASE_IN_OUT },
  },
};

/** Snowflakes and gold stars that burst out of the box as the lid lifts. */
export const SPARKLE = {
  count: 14,
  distance: 84,
  distanceJitter: 0.55,
  dotSize: 3.5,
  starSize: 12,
  snowflakeSize: 11,
  /** Fan from upper-left to upper-right. */
  startAngle: -168,
  sweep: 156,
} as const;

/**
 * Dialogs slide up on a phone and fade and scale on a laptop.
 * The backdrop fades in both cases (see `.motion-dialog` in globals.css).
 */
export const DIALOG_PHONE: Variants = {
  hidden: { opacity: 0, y: 28, scale: 1, transition: TRANSITION.list },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING.pop },
};

export const DIALOG_LAPTOP: Variants = {
  hidden: { opacity: 0, y: 0, scale: 0.97, transition: TRANSITION.list },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING.pop },
};

/** The claim confirmation panel. */
export const CONFIRMATION: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING.pop },
};

/**
 * Snow has two layers: a slow, faint back and a larger, brighter front.
 * The header variant is the lighter version for pine bands on light screens.
 */
export const SNOW = {
  /** Full-screen snow: 45 flakes, split into two layers. */
  backCount: 30,
  frontCount: 15,
  headerBackCount: 9,
  headerFrontCount: 6,
  backMinSize: 1.2,
  backMaxSize: 2.8,
  frontMinSize: 2.8,
  frontMaxSize: 5.2,
  backMinSpeed: 30,
  backMaxSpeed: 45,
  frontMinSpeed: 45,
  frontMaxSpeed: 70,
  backMinOpacity: 0.35,
  backMaxOpacity: 0.5,
  frontMinOpacity: 0.55,
  frontMaxOpacity: 0.85,
  headerSizeScale: 0.8,
  headerSpeedScale: 0.9,
  headerOpacityScale: 0.85,
  /** Every nth front flake is a snowflake shape rather than a dot. */
  snowflakeEvery: 4,
  headerSnowflakeEvery: 3,
  /** A few gold stars drift among the flakes. */
  starCount: 3,
  starMinSize: 7,
  starMaxSize: 12,
  starMinSpeed: 35,
  starMaxSpeed: 55,
  starOpacity: 0.75,
  /** How far a flake sways from side to side, in pixels. */
  sway: 14,
  headerSwayScale: 0.6,
  maxSpin: 30,
  /** Opacity twinkle range (multiplier of the star's base opacity). */
  twinkle: 0.35,
} as const;

export const CONFETTI = {
  /** Cranberry and gold paper pieces. */
  paperColorVars: ['--color-cranberry', '--color-gold'],
  /** Gold and snow stars and snowflakes. */
  goldColorVars: ['--color-gold', '--color-snow'],
  count: 120,
  spread: 72,
  startVelocity: 38,
  gravity: 0.9,
  ticks: 160,
  scalar: 0.95,
  paperShapes: ['square', 'circle'],
  secondWaveDelayMs: 120,
  secondWaveCount: 60,
  starDelayMs: 190,
  starCount: 40,
  starSpread: 110,
  starVelocity: 34,
  starGravity: 0.7,
  starScalar: 1.15,
} as const;
