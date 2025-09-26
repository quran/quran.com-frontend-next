import React, { ReactNode } from 'react';

import * as RadixHoverCard from '@radix-ui/react-hover-card';

import styles from './HoverCard.module.scss';

export enum ContentSide {
  TOP = 'top',
  RIGHT = 'right',
  BOTTOM = 'bottom',
  LEFT = 'left',
}

export enum ContentAlign {
  START = 'start',
  CENTER = 'center',
  END = 'end',
}

interface Props {
  body: ReactNode;
  children: ReactNode | ReactNode[];
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  contentSide?: ContentSide;
  contentAlign?: ContentAlign;
  shouldAvoidCollisions?: boolean;
  hasTip?: boolean;
  openDelay?: number;
  closeDelay?: number;
}

const HoverCard: React.FC<Props> = ({
  body,
  children,
  onOpenChange,
  isOpen,
  contentSide = ContentSide.BOTTOM,
  contentAlign = ContentAlign.CENTER,
  shouldAvoidCollisions = true,
  openDelay = 400,
  closeDelay = 300,
  hasTip = true,
}) => (
  <RadixHoverCard.Root
    openDelay={openDelay}
    closeDelay={closeDelay}
    {...(typeof isOpen !== 'undefined' && { open: isOpen })}
    {...(onOpenChange && { onOpenChange })}
  >
    <RadixHoverCard.Trigger asChild className={styles.trigger}>
      <div>{children}</div>
    </RadixHoverCard.Trigger>
    <RadixHoverCard.Content
      sideOffset={2}
      side={contentSide}
      align={contentAlign}
      avoidCollisions={shouldAvoidCollisions}
      className={styles.content}
    >
      {body}
      {hasTip && <RadixHoverCard.Arrow />}
    </RadixHoverCard.Content>
  </RadixHoverCard.Root>
);

export default HoverCard;
