'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';
import { SNOW } from './presets';
import { SnowflakeMark, SparkleStar } from './Sparkle';

interface Bounds {
  width: number;
  height: number;
}

const EMPTY_BOUNDS: Bounds = { width: 0, height: 0 };

type SnowVariant = 'full' | 'header';
type PieceKind = 'dot' | 'snowflake' | 'star';

interface Piece {
  kind: PieceKind;
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  swayRate: number;
  phase: number;
  opacity: number;
  rotate: number;
  spin: number;
  twinkleRate: number;
}

/** Stable pseudo-random value so server and client agree during hydration. */
function seeded(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function makeFlake(
  index: number,
  layer: 'back' | 'front',
  header: boolean,
  bounds: Bounds,
): Piece {
  const back = layer === 'back';
  const sizeScale = header ? SNOW.headerSizeScale : 1;
  const speedScale = header ? SNOW.headerSpeedScale : 1;
  const opacityScale = header ? SNOW.headerOpacityScale : 1;
  const seedOffset = back ? 0 : 50;

  const minSize = back ? SNOW.backMinSize : SNOW.frontMinSize;
  const maxSize = back ? SNOW.backMaxSize : SNOW.frontMaxSize;
  const minSpeed = back ? SNOW.backMinSpeed : SNOW.frontMinSpeed;
  const maxSpeed = back ? SNOW.backMaxSpeed : SNOW.frontMaxSpeed;
  const minOpacity = back ? SNOW.backMinOpacity : SNOW.frontMinOpacity;
  const maxOpacity = back ? SNOW.backMaxOpacity : SNOW.frontMaxOpacity;

  const snowflakeEvery = header ? SNOW.headerSnowflakeEvery : SNOW.snowflakeEvery;
  const snowflake = !back && index % snowflakeEvery === 0;
  const baseSize = minSize + seeded(index + seedOffset + 1) * (maxSize - minSize);

  return {
    kind: snowflake ? 'snowflake' : 'dot',
    x: seeded(index + seedOffset + 3) * bounds.width,
    y: seeded(index + seedOffset + 17) * bounds.height,
    size: (snowflake ? baseSize + 1.8 : baseSize) * sizeScale,
    speed:
      (minSpeed + seeded(index + seedOffset + 7) * (maxSpeed - minSpeed)) *
      speedScale,
    sway:
      (0.35 + seeded(index + seedOffset + 31) * 0.65) *
      SNOW.sway *
      (header ? SNOW.headerSwayScale : 1),
    swayRate: back
      ? 0.2 + seeded(index + seedOffset + 37) * 0.3
      : 0.3 + seeded(index + seedOffset + 37) * 0.4,
    phase: seeded(index + seedOffset + 41) * Math.PI * 2,
    opacity:
      (minOpacity + seeded(index + seedOffset + 19) * (maxOpacity - minOpacity)) *
      opacityScale,
    rotate: seeded(index + seedOffset + 23) * 360,
    spin: (seeded(index + seedOffset + 13) - 0.5) * SNOW.maxSpin * (snowflake ? 0.6 : 1),
    twinkleRate: 0.6 + seeded(index + seedOffset + 43) * 0.8,
  };
}

function makeStar(index: number, bounds: Bounds): Piece {
  const seedOffset = 101 + index;

  return {
    kind: 'star',
    x: seeded(seedOffset + 3) * bounds.width,
    y: seeded(seedOffset + 17) * bounds.height,
    size: SNOW.starMinSize + seeded(seedOffset + 1) * (SNOW.starMaxSize - SNOW.starMinSize),
    speed: SNOW.starMinSpeed + seeded(seedOffset + 7) * (SNOW.starMaxSpeed - SNOW.starMinSpeed),
    sway: (0.4 + seeded(seedOffset + 31) * 0.6) * SNOW.sway,
    swayRate: 0.2 + seeded(seedOffset + 37) * 0.35,
    phase: seeded(seedOffset + 41) * Math.PI * 2,
    opacity: SNOW.starOpacity,
    rotate: seeded(seedOffset + 23) * 360,
    spin: (seeded(seedOffset + 13) - 0.5) * 18,
    twinkleRate: 0.7 + seeded(seedOffset + 43) * 0.6,
  };
}

function makePieces(bounds: Bounds, variant: SnowVariant): Piece[] {
  const header = variant === 'header';
  const backCount = header ? SNOW.headerBackCount : SNOW.backCount;
  const frontCount = header ? SNOW.headerFrontCount : SNOW.frontCount;

  const back = Array.from({ length: backCount }, (_, index) =>
    makeFlake(index, 'back', header, bounds),
  );
  const front = Array.from({ length: frontCount }, (_, index) =>
    makeFlake(index + 50, 'front', header, bounds),
  );
  const stars = header
    ? []
    : Array.from({ length: SNOW.starCount }, (_, index) => makeStar(index, bounds));

  return [...back, ...front, ...stars];
}

function SnowPiece({ piece, bounds }: { piece: Piece; bounds: Bounds }) {
  const travel = bounds.height + piece.size * 2;
  const duration = travel / piece.speed;
  const startFraction = Math.min(1, Math.max(0, piece.y / bounds.height));
  const swayDuration = Math.PI / piece.swayRate;
  const twinkleDuration = Math.PI / piece.twinkleRate;
  const spin = piece.spin * swayDuration;
  const isDot = piece.kind === 'dot';
  const style = {
    left: piece.x,
    top: -piece.size,
    width: piece.size,
    height: piece.size,
    opacity: isDot ? piece.opacity : undefined,
    '--snow-travel': `${travel}px`,
    '--snow-duration': `${duration}s`,
    '--snow-delay': `${-startFraction * duration}s`,
    '--snow-sway': `${piece.sway}px`,
    '--snow-sway-duration': `${swayDuration}s`,
    '--snow-spin': `${spin}deg`,
    '--snow-opacity': piece.opacity,
    '--snow-twinkle-duration': `${twinkleDuration}s`,
  } as CSSProperties;

  return (
    <span
      data-snow-star={piece.kind === 'star' ? 'true' : undefined}
      data-snowflake={piece.kind === 'snowflake' ? 'true' : undefined}
      className={`snow-piece absolute top-0 ${piece.kind === 'star' ? 'text-gold' : 'text-snow'}`}
      style={style}
    >
      <span className="snow-drift block h-full w-full">
        {isDot ? (
          <span className="block h-full w-full rounded-full bg-snow" />
        ) : (
          <span
            className="snow-shape block h-full w-full"
            style={{ rotate: `${piece.rotate}deg` }}
          >
            {piece.kind === 'star' ? (
              <SparkleStar className="h-full w-full" />
            ) : (
              <SnowflakeMark className="h-full w-full" />
            )}
          </span>
        )}
      </span>
    </span>
  );
}

function SnowLayer({ bounds, variant }: { bounds: Bounds; variant: SnowVariant }) {
  const [pieces] = useState(() => makePieces(bounds, variant));

  return (
    <>
      {pieces.map((piece, index) => (
        <SnowPiece key={index} piece={piece} bounds={bounds} />
      ))}
    </>
  );
}

/**
 * A light snow layer for dark screens: two depths, soft flakes, a few gold
 * stars. Pure CSS transforms keep it on the compositor; the header variant is
 * a lighter drift for pine bands on light screens. Paused while hidden.
 */
export function Snowfall({
  className = '',
  variant = 'full',
}: {
  className?: string;
  variant?: SnowVariant;
}) {
  const reduce = useReducedMotion();
  const container = useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = useState<Bounds>(EMPTY_BOUNDS);

  useEffect(() => {
    if (reduce) {
      return;
    }

    const element = container.current;

    if (!element) {
      return;
    }

    function measure() {
      if (!element) {
        return;
      }

      const next = {
        width: element.clientWidth,
        // A full-page layer seeds within one viewport so all 45 flakes are
        // visible on a phone; a header seeds within its own band.
        height:
          variant === 'header'
            ? element.clientHeight
            : Math.min(element.clientHeight, window.innerHeight),
      };

      setBounds((previous) =>
        previous.width === next.width && previous.height === next.height
          ? previous
          : next,
      );
    }

    function syncPaused() {
      element?.classList.toggle('snow-paused', document.hidden);
    }

    measure();
    syncPaused();
    document.addEventListener('visibilitychange', syncPaused);

    if (typeof ResizeObserver === 'undefined') {
      return () => document.removeEventListener('visibilitychange', syncPaused);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPaused);
    };
  }, [reduce, variant]);

  return (
    <div
      ref={container}
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {!reduce && bounds.width > 0 && bounds.height > 0 ? (
        <SnowLayer bounds={bounds} variant={variant} />
      ) : null}
    </div>
  );
}
