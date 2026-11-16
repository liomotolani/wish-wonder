import type { Transition, Variants } from 'motion/react';

/**
 * The single source of truth for motion in Wish & Wonder.
 * Components must take timings, easings, springs and variants from here.
 * Only transform and opacity are animated.
 */

type Bezier = [number, number, number, number];

export const EASE_OUT: Bezier = [0.22, 1, 0.36, 1];
export const EASE_SOFT: Bezier = [0.2, 0.9, 0.3, 1];
export const EASE_IN_OUT: Bezier = [0.65, 0, 0.35, 1];

export const DURATION = {
  /** Press feedback on tiles and buttons. */
  press: 0.14,
  /** Small state changes: toasts, fades, list items. */
  feedback: 0.2,
  /** A list item settling into place. */
  list: 0.28,
  /** Delay between list items. */
  stagger: 0.045,
  /** Bottom sheets and dialogs. */
  sheet: 0.3,
  /** The one-off gold outline pulse on a Peeked box. */
  peekPulse: 0.8,
  peekPulseStep: 0.06,
  /** The ring that leaves a tapped mystery box. */
  tapRing: 0.38,
  reveal: {
    /** A breath before the box starts to open. */
    lead: 0.1,
    /** The tapped tile and the box on the reveal screen. */
    wiggle: 0.26,
    /** The lid lifting and tilting away. */
    lid: 0.55,
    /** The gold glow blooming behind the box. */
    glow: 0.8,
    /** The "Mystery gift revealed" heading. */
    heading: 0.4,
    headingDelay: 0.4,
    /** The gift card sliding up. */
    card: 0.55,
    cardDelay: 0.42,
    /** When the whole sequence is done and input is fully live. */
    total: 1.15,
  },
} as const;

export const SPRING = {
  press: { type: 'spring', stiffness: 600, damping: 32, mass: 0.6 },
  soft: { type: 'spring', stiffness: 260, damping: 26, mass: 0.9 },
} satisfies Record<string, Transition>;

export const TRANSITION = {
  press: { duration: DURATION.press, ease: EASE_OUT },
  feedback: { duration: DURATION.feedback, ease: EASE_OUT },
  list: { duration: DURATION.list, ease: EASE_OUT },
  sheet: { duration: DURATION.sheet, ease: EASE_OUT },
  card: { duration: DURATION.reveal.card, ease: EASE_OUT },
} satisfies Record<string, Transition>;

export const PRESS = {
  scale: 0.97,
  hoverLift: -2,
} as const;

export const STAGGER = {
  delayChildren: 0.02,
  staggerChildren: DURATION.stagger,
} as const;

export const LIST_CONTAINER: Variants = {
  hidden: {},
  visible: { transition: STAGGER },
};

export const LIST_ITEM: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITION.list,
  },
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
 * Dialogs slide up on a phone and fade and scale on a laptop.
 * The backdrop fades in both cases (see `.motion-dialog` in globals.css).
 */
export const DIALOG_PHONE: Variants = {
  hidden: { opacity: 0, y: 28, scale: 1 },
  visible: { opacity: 1, y: 0, scale: 1, transition: TRANSITION.sheet },
};

export const DIALOG_LAPTOP: Variants = {
  hidden: { opacity: 0, y: 0, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: TRANSITION.sheet },
};

/** The claim confirmation panel. */
export const CONFIRMATION: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: SPRING.soft },
};

export const SNOW = {
  count: 14,
  minSize: 2,
  maxSize: 5,
  minSpeed: 16,
  maxSpeed: 38,
  minOpacity: 0.24,
  maxOpacity: 0.6,
  maxSpin: 22,
} as const;

export const CONFETTI = {
  /** Resolved from the Midnight Pine tokens at claim time. */
  colorVars: ['--color-cranberry', '--color-gold', '--color-snow', '--color-pine-700'],
  count: 80,
  spread: 70,
  startVelocity: 38,
  gravity: 0.9,
  ticks: 150,
  scalar: 0.9,
  secondWaveDelayMs: 160,
  secondWaveCount: 36,
} as const;
