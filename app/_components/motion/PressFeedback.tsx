'use client';

import { useEffect } from 'react';
import { animate, useReducedMotion } from 'motion/react';
import { DURATION, EASE_OUT, PRESS } from './presets';

const PRESSABLE = 'button:not(:disabled), a[href]';
/** Components that run their own Motion animation opt out. */
const SELF_ANIMATED = '[data-motion-own]';

function findPressable(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const element = target.closest<HTMLElement>(PRESSABLE);

  if (!element || element.closest(SELF_ANIMATED)) {
    return null;
  }

  return element;
}

/**
 * A global interaction layer so every button and link gives the same tiny
 * press-down, and a lift on hover where a real mouse exists.
 */
export function PressFeedback() {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      return;
    }

    let pressed: HTMLElement | null = null;

    function handlePointerDown(event: PointerEvent) {
      const element = findPressable(event.target);

      if (!element) {
        return;
      }

      pressed = element;
      animate(
        element,
        { scale: PRESS.scale },
        { duration: DURATION.press, ease: EASE_OUT },
      );
    }

    function release() {
      if (!pressed) {
        return;
      }

      animate(pressed, { scale: 1 }, { duration: DURATION.press, ease: EASE_OUT });
      pressed = null;
    }

    function handlePointerOver(event: PointerEvent) {
      if (event.pointerType !== 'mouse') {
        return;
      }

      const element = findPressable(event.target);

      if (!element || element.contains(event.relatedTarget as Node | null)) {
        return;
      }

      animate(
        element,
        { y: PRESS.hoverLift },
        { duration: DURATION.feedback, ease: EASE_OUT },
      );
    }

    function handlePointerOut(event: PointerEvent) {
      if (event.pointerType !== 'mouse') {
        return;
      }

      const element = findPressable(event.target);

      if (!element || element.contains(event.relatedTarget as Node | null)) {
        return;
      }

      animate(element, { y: 0 }, { duration: DURATION.feedback, ease: EASE_OUT });
    }

    window.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointerup', release, true);
    window.addEventListener('pointercancel', release, true);
    window.addEventListener('pointerover', handlePointerOver, true);
    window.addEventListener('pointerout', handlePointerOut, true);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
      window.removeEventListener('pointerup', release, true);
      window.removeEventListener('pointercancel', release, true);
      window.removeEventListener('pointerover', handlePointerOver, true);
      window.removeEventListener('pointerout', handlePointerOut, true);
    };
  }, [reduce]);

  return null;
}
