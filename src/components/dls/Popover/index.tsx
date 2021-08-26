import React, { ReactNode } from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import styles from './Popover.module.scss';

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
  trigger: ReactNode;
  children: ReactNode | ReactNode[];
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  isModal?: boolean;
  contentSide?: ContentSide;
  contentAlign?: ContentAlign;
  avoidCollisions?: boolean;
}

const Popover: React.FC<Props> = ({
  children,
  trigger,
  onOpenChange,
  open,
  isModal = false,
  contentSide = ContentSide.BOTTOM,
  contentAlign = ContentAlign.CENTER,
  avoidCollisions = true,
}) => (
  <div className={styles.container}>
    <RadixPopover.Root
      modal={isModal}
      {...(typeof open !== 'undefined' && { open })}
      {...(onOpenChange && { onOpenChange })}
    >
      <RadixPopover.Trigger aria-label="Open popover" className={styles.trigger}>
        {trigger}
      </RadixPopover.Trigger>
      <RadixPopover.Content
        portalled={false}
        sideOffset={2}
        side={contentSide}
        align={contentAlign}
        avoidCollisions={avoidCollisions}
        className={styles.content}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Root>
  </div>
);

export default Popover;
