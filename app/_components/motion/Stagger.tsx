'use client';

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';
import { motion } from 'motion/react';
import { LIST_CONTAINER, LIST_ITEM, TRANSITION } from './presets';

type StaggerTag = 'ul' | 'ol' | 'tbody' | 'div';

interface StaggerListProps {
  children: ReactNode;
  className?: string;
  as?: StaggerTag;
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  as?: 'li' | 'tr' | 'div';
  index?: number;
  [key: `data-${string}`]: string | undefined;
}

const CONTAINERS = {
  ul: motion.ul,
  ol: motion.ol,
  tbody: motion.tbody,
  div: motion.div,
};

const ITEMS = {
  li: motion.li,
  tr: motion.tr,
  div: motion.div,
};

/**
 * Gifts, members and claims fade and slide in with a short stagger on first
 * load. Items also carry `layout`, so remaining rows glide up when a release
 * or delete removes one.
 */
export function StaggerList({ children, className, as = 'ul' }: StaggerListProps) {
  const Component = CONTAINERS[as];
  const items = Children.toArray(children).map((child, index) => {
    if (!isValidElement(child)) {
      return child;
    }

    return cloneElement(child as ReactElement<{ index?: number }>, { index });
  });

  return (
    <Component
      className={className}
      variants={LIST_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      {items}
    </Component>
  );
}

export function StaggerItem({
  children,
  className,
  as = 'li',
  index,
  ...rest
}: StaggerItemProps) {
  const Component = ITEMS[as];

  return (
    <Component
      className={className}
      variants={LIST_ITEM}
      custom={index}
      layout
      transition={TRANSITION.list}
      {...rest}
    >
      {children}
    </Component>
  );
}
