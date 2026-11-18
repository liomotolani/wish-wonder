'use client';

import { useEffect, useState, type ReactNode, type RefObject } from 'react';
import { motion } from 'motion/react';
import { DIALOG_LAPTOP, DIALOG_PHONE } from './presets';
import { useIsLaptop } from './useMediaQuery';

interface MotionDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  labelledBy: string;
  className?: string;
  /** Anchors the dialog to the bottom of a phone, like a sheet. */
  mobileSheet?: boolean;
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
  mobileSheet = false,
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
      className={`motion-dialog bg-white p-0 text-ink shadow-2xl backdrop:bg-pine-900/70 ${
        mobileSheet
          ? 'mt-auto mb-0 w-full max-w-none rounded-t-3xl rounded-b-none border-0 sm:m-auto sm:w-[calc(100%-2rem)] sm:max-w-lg sm:rounded-3xl'
          : 'm-auto w-[calc(100%-2rem)] rounded-3xl border-0'
      } ${className}`}
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
