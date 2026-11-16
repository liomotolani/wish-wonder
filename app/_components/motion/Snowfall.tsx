'use client';

import { useState, useSyncExternalStore } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import { SNOW } from './presets';

interface Bounds {
  width: number;
  height: number;
}

const EMPTY_BOUNDS: Bounds = { width: 0, height: 0 };

/** Cached so `getSnapshot` returns the same object until the window resizes. */
let cachedBounds: Bounds = EMPTY_BOUNDS;

function subscribeToResize(onChange: () => void): () => void {
  window.addEventListener('resize', onChange, { passive: true });
  return () => window.removeEventListener('resize', onChange);
}

function getBoundsSnapshot(): Bounds {
  if (
    cachedBounds.width !== window.innerWidth ||
    cachedBounds.height !== window.innerHeight
  ) {
    cachedBounds = { width: window.innerWidth, height: window.innerHeight };
  }

  return cachedBounds;
}

function getServerBoundsSnapshot(): Bounds {
  return EMPTY_BOUNDS;
}

/** Stable pseudo-random value so server and client agree during hydration. */
function seeded(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function Flake({ index, bounds }: { index: number; bounds: Bounds }) {
  const size = SNOW.minSize + seeded(index + 1) * (SNOW.maxSize - SNOW.minSize);
  const speed = SNOW.minSpeed + seeded(index + 7) * (SNOW.maxSpeed - SNOW.minSpeed);
  const spin = (seeded(index + 13) - 0.5) * SNOW.maxSpin;
  const opacity = SNOW.minOpacity + seeded(index + 19) * (SNOW.maxOpacity - SNOW.minOpacity);
  const drift = (seeded(index + 29) - 0.5) * 10;

  const [start] = useState(() => ({
    x: seeded(index + 3) * bounds.width,
    y: seeded(index + 17) * bounds.height,
    rotate: seeded(index + 23) * 360,
  }));

  const x = useMotionValue(start.x);
  const y = useMotionValue(start.y);
  const rotate = useMotionValue(start.rotate);

  useAnimationFrame((_, delta) => {
    // Pause while the tab is hidden; skip the jump when it comes back.
    if (document.hidden || delta > 64) {
      return;
    }

    const seconds = Math.min(delta, 64) / 1000;
    let nextY = y.get() + speed * seconds;
    let nextX = x.get() + drift * seconds;

    if (nextY > bounds.height + size) {
      nextY = -size;
      nextX = Math.random() * bounds.width;
    }
    if (nextX < -size) {
      nextX = bounds.width + size;
    }
    if (nextX > bounds.width + size) {
      nextX = -size;
    }

    y.set(nextY);
    x.set(nextX);
    rotate.set(rotate.get() + spin * seconds);
  });

  return (
    <motion.span
      className="absolute left-0 top-0 rounded-full bg-snow"
      style={{ x, y, rotate, width: size, height: size, opacity }}
    />
  );
}

/**
 * A light snow layer for dark screens only. Few flakes, slow, transform-only,
 * behind the content, and paused while the tab is hidden.
 */
export function Snowfall({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  const bounds = useSyncExternalStore(
    subscribeToResize,
    getBoundsSnapshot,
    getServerBoundsSnapshot,
  );

  if (reduce || bounds.width === 0) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {Array.from({ length: SNOW.count }, (_, index) => (
        <Flake key={index} index={index} bounds={bounds} />
      ))}
    </div>
  );
}
