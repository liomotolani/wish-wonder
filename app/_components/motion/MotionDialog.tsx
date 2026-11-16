'use client';

import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { motion } from 'motion/react';
import { DIALOG_LAPTOP, DIALOG_PHONE } from './presets';
import { useIsLaptop } from './useMediaQuery';

interface MotionDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}

/**
 * The shared dialog shell: slides up on a phone, fades and scales on a laptop,
 * with a fading backdrop. Focus handling stays native to `<dialog>`.
 */
export function MotionDialog({
  dialogRef,
  labelledBy,
  className = '',
  children,
}: MotionDialogProps) {
  const isLaptop = useIsLaptop();
  const [open, setOpen] = useState(false);
  const [element, setElement] = useState<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!element) {
      return;
    }

    function handleToggle() {
      setOpen(element?.open ?? false);
    }

    handleToggle();
    element.addEventListener('toggle', handleToggle);
    return () => element.removeEventListener('toggle', handleToggle);
  }, [element]);

  function setRef(node: HTMLDialogElement | null) {
    dialogRef.current = node;
    setElement(node);
  }

  return (
    <dialog
      ref={setRef}
      aria-labelledby={labelledBy}
      className={`motion-dialog m-auto w-[calc(100%-2rem)] rounded-3xl border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-pine-900/70 ${className}`}
    >
      <motion.div
        initial={false}
        animate={open ? 'visible' : 'hidden'}
        variants={isLaptop ? DIALOG_LAPTOP : DIALOG_PHONE}
      >
        {children}
      </motion.div>
    </dialog>
  );
}
