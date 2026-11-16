'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import type { MysteryBoxState } from '@/lib/types';
import { mysteryToneFor } from '@/lib/mystery-tone';
import { EyeIcon, CheckIcon } from '@/app/_components/icons';
import {
  prefetchReveal,
  readBoxState,
  subscribeBoxState,
} from '@/app/_components/reveal-cache';
import {
  DURATION,
  EASE_IN_OUT,
  GLINT,
  PRESS,
  SPRING,
  TRANSITION,
  useMediaQuery,
} from '@/app/_components/motion';

interface MysteryTileProps {
  number: number;
  state: MysteryBoxState;
  href?: string;
  visitId?: string;
}

const TILE_CLASS =
  'group relative block aspect-square w-full overflow-hidden rounded-[22px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold';

/** A wrapping-paper sheen that crosses the tile once on laptop hover. */
function Sheen({ active }: { active: boolean }) {
  return (
    <motion.span
      data-glint="tile"
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-[-25%] left-0 z-10 w-1/3"
      style={{
        backgroundImage:
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
      }}
      variants={GLINT}
      initial="rest"
      animate={active ? 'hover' : 'rest'}
    />
  );
}

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

export function MysteryTile({ number, state, href, visitId }: MysteryTileProps) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const controls = useAnimationControls();
  const [opening, setOpening] = useState(false);
  const [sheen, setSheen] = useState(false);
  const cachedState = useSyncExternalStore(
    subscribeBoxState,
    () => readBoxState(visitId ?? '', number),
    () => null,
  );
  const localState = opening
    ? state
    : cachedState === 'taken'
      ? 'taken'
      : state === 'mystery'
        ? (cachedState ?? 'mystery')
        : state;

  function open() {
    if (!href) {
      return;
    }

    if (opening) {
      return;
    }

    setOpening(true);

    // Start the reveal request and the next route while the tile animates.
    if (visitId) {
      prefetchReveal(visitId, number);
    }
    router.prefetch(href);

    if (reduce) {
      router.push(href);
      return;
    }

    // A quick jingle-bell shake before the next screen's box opens.
    void controls.start(
      { rotate: [0, 6, -6, 6, -6, 0] },
      { duration: DURATION.tileShake, ease: EASE_IN_OUT },
    );
    window.setTimeout(() => router.push(href), DURATION.tileShake * 1000);
  }

  if (localState === 'taken') {
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

  const hover =
    !reduce && finePointer ? { y: PRESS.hoverLift, transition: SPRING.pop } : undefined;
  const hoverHandlers =
    !reduce && finePointer
      ? { onHoverStart: () => setSheen(true), onHoverEnd: () => setSheen(false) }
      : {};

  if (localState === 'peeked') {
    return (
      <motion.div
        data-motion-own
        animate={controls}
        whileHover={hover}
        {...hoverHandlers}
        className="relative"
      >
        {!reduce ? (
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
        ) : null}

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
          {opening && !reduce ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-30 rounded-[22px] border-2 border-gold"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 0.95, 0], scale: [0.7, 1.12, 1.4] }}
              transition={{ duration: DURATION.tileShake, ease: 'easeOut' }}
            />
          ) : null}
          <EyeIcon className="absolute right-3 top-3 h-4 w-4 text-gold" />
          <span className="text-3xl font-extrabold leading-none text-gold sm:text-4xl">
            {number}
          </span>
          <span className="mt-1 text-sm font-semibold">Peeked</span>
          <Sheen active={sheen} />
        </Link>
      </motion.div>
    );
  }

  const tone = mysteryToneFor(number);

  return (
    <motion.div
      data-motion-own
      animate={controls}
      whileHover={hover}
      {...hoverHandlers}
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
        {opening && !reduce ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-30 rounded-[22px] border-2 border-gold"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: [0, 0.95, 0], scale: [0.7, 1.12, 1.4] }}
            transition={{ duration: DURATION.tileShake, ease: 'easeOut' }}
          />
        ) : null}
        <span className={`absolute inset-y-0 left-[54%] w-3 ${tone.ribbon}`} aria-hidden="true" />
        <span className={`absolute inset-x-0 top-[36%] h-3 ${tone.ribbon}`} aria-hidden="true" />
        <motion.span
          className="absolute left-[37%] top-[22%] h-10 w-10"
          animate={
            opening
              ? { y: -18, rotate: 16, opacity: 0 }
              : { y: 0, rotate: 0, opacity: 1 }
          }
          transition={SPRING.pop}
        >
          <Bow className={`h-full w-full ${tone.number}`} />
        </motion.span>
        <span
          className={`absolute bottom-2.5 left-3 text-4xl font-extrabold leading-none tracking-tight sm:text-5xl ${tone.number}`}
        >
          {number}
        </span>
        <Sheen active={sheen} />
      </Link>
    </motion.div>
  );
}
