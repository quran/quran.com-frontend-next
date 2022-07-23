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
  open?: boolean;
  contentSide?: ContentSide;
  contentAlign?: ContentAlign;
  avoidCollisions?: boolean;
  tip?: boolean;
  openDelay?: number;
  closeDelay?: number;
}

const HoverCard: React.FC<Props> = ({
  body,
  children,
  onOpenChange,
  open,
  contentSide = ContentSide.BOTTOM,
  contentAlign = ContentAlign.CENTER,
  avoidCollisions = true,
  openDelay = 400,
  closeDelay = 300,
  tip = true,
}) => (
  <RadixHoverCard.Root
    openDelay={openDelay}
    closeDelay={closeDelay}
    {...(typeof open !== 'undefined' && { open })}
    {...(onOpenChange && { onOpenChange })}
  >
    <RadixHoverCard.Trigger asChild className={styles.trigger}>
      <div>{children}</div>
    </RadixHoverCard.Trigger>
    <RadixHoverCard.Content
      sideOffset={2}
      side={contentSide}
      align={contentAlign}
      avoidCollisions={avoidCollisions}
      className={styles.content}
    >
      {body}
      {tip && <RadixHoverCard.Arrow />}
    </RadixHoverCard.Content>
  </RadixHoverCard.Root>
);

export default HoverCard;
