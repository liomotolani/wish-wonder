'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import type { MysteryBoxState } from '@/lib/types';
import { EyeIcon, CheckIcon } from '@/app/_components/icons';
import {
  DURATION,
  EASE_SOFT,
  PRESS,
  TRANSITION,
  useMediaQuery,
} from '@/app/_components/motion';

interface MysteryTileProps {
  number: number;
  state: MysteryBoxState;
  href?: string;
}

const TONES = [
  {
    box: 'bg-pine-700',
    ribbon: 'bg-gold',
    number: 'text-snow',
    border: 'border border-transparent',
  },
  {
    box: 'bg-cranberry',
    ribbon: 'bg-gold',
    number: 'text-snow',
    border: 'border border-transparent',
  },
  {
    box: 'bg-gold',
    ribbon: 'bg-cranberry',
    number: 'text-pine-900',
    border: 'border border-transparent',
  },
] as const;

const TILE_CLASS =
  'group relative block aspect-square w-full overflow-hidden rounded-[22px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold';

function Bow({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 9C9.5 4.5 4 6 6.5 10.5 8 13 12 12.5 12 12.5s4 .5 5.5-2C20 6 14.5 4.5 12 9Z" />
      <path d="M12 9v6" />
    </svg>
  );
}

export function MysteryTile({ number, state, href }: MysteryTileProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const controls = useAnimationControls();
  const [opening, setOpening] = useState(false);

  function open() {
    if (!href) {
      return;
    }

    if (opening) {
      return;
    }

    setOpening(true);

    if (reduce) {
      router.push(href);
      return;
    }

    void controls.start(
      { rotate: [0, -2.5, 2.5, -1, 0], scale: [1, 1.045, 1.02, 1] },
      { duration: DURATION.reveal.wiggle, ease: EASE_SOFT },
    );
    window.setTimeout(() => router.push(href), DURATION.reveal.wiggle * 1000);
  }

  if (state === 'taken') {
    return (
      <motion.div
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={TRANSITION.feedback}
        className="relative flex aspect-square w-full flex-col justify-center overflow-hidden rounded-[22px] border border-dashed border-snow/30 bg-pine-900/40 px-3 py-3 text-snow/60"
        role="img"
        aria-label={`Number ${number}, taken`}
      >
        <CheckIcon className="absolute right-3 top-3 h-4 w-4" />
        <span className="text-3xl font-extrabold leading-none sm:text-4xl">{number}</span>
        <span className="mt-1 text-sm font-semibold">Taken</span>
      </motion.div>
    );
  }

  const hover = finePointer ? { y: PRESS.hoverLift } : undefined;

  if (state === 'peeked') {
    return (
      <motion.div
        data-motion-own
        animate={controls}
        whileHover={hover}
        className="relative"
      >
        <motion.span
          aria-hidden="true"
          style={{ opacity: 0 }}
          className="reveal-prestart pointer-events-none absolute inset-0 z-20 rounded-[22px] border-2 border-gold"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: [0, 0.85, 0], scale: [0.98, 1.02, 1.04] }}
          transition={{
            duration: DURATION.peekPulse,
            times: [0, 0.35, 1],
            delay: DURATION.peekPulseStep * (number % 5),
          }}
        />

        <Link
          href={href ?? '#'}
          onClick={(event) => {
            if (!href || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
              return;
            }
            event.preventDefault();
            open();
          }}
          aria-busy={opening || undefined}
          className={`${TILE_CLASS} flex flex-col justify-center border-2 border-gold/70 bg-pine-900/80 px-3 py-3 text-snow`}
          aria-label={`Number ${number}, peeked. Open again.`}
        >
          {opening ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30 rounded-[22px] border-2 border-gold"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 0.95, 0], scale: [0.7, 1.12, 1.4] }}
              transition={{ duration: DURATION.tapRing, ease: 'easeOut' }}
            />
          ) : null}
          <EyeIcon className="absolute right-3 top-3 h-4 w-4 text-gold" />
          <span className="text-3xl font-extrabold leading-none text-gold sm:text-4xl">
            {number}
          </span>
          <span className="mt-1 text-sm font-semibold">Peeked</span>
        </Link>
      </motion.div>
    );
  }

  const tone = TONES[(number - 1) % TONES.length];

  return (
    <motion.div
      data-motion-own
      animate={controls}
      whileHover={hover}
      className="relative"
    >
      <Link
        href={href ?? '#'}
        onClick={(event) => {
          if (!href || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
          }
          event.preventDefault();
          open();
        }}
        aria-busy={opening || undefined}
        className={`${TILE_CLASS} ${tone.box} ${tone.border}`}
        aria-label={`Number ${number}, mystery gift. Peek inside.`}
      >
        {opening ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 rounded-[22px] border-2 border-gold"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 0.95, 0], scale: [0.7, 1.12, 1.4] }}
            transition={{ duration: DURATION.tapRing, ease: 'easeOut' }}
          />
        ) : null}
        <span className={`absolute inset-y-0 left-[54%] w-3 ${tone.ribbon}`} aria-hidden="true" />
        <span className={`absolute inset-x-0 top-[36%] h-3 ${tone.ribbon}`} aria-hidden="true" />
        <Bow className={`absolute left-[37%] top-[22%] h-10 w-10 ${tone.number}`} />
        <span
          className={`absolute bottom-2.5 left-3 text-4xl font-extrabold leading-none tracking-tight sm:text-5xl ${tone.number}`}
        >
          {number}
        </span>
      </Link>
    </motion.div>
  );
}
