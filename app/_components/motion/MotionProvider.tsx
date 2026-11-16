'use client';

import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';

/**
 * One place to honour the OS reduced-motion setting. Motion then keeps
 * opacity fades and drops transforms, so every component inherits the rule.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
