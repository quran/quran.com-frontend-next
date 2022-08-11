import React, { ReactNode } from 'react';

import * as RadixPopover from '@radix-ui/react-popover';
import classNames from 'classnames';

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
  tip?: boolean;
  avoidCollisions?: boolean;
  useTooltipStyles?: boolean;
  defaultStyling?: boolean;
  isPortalled?: boolean;
  triggerStyles?: string;
  contentStyles?: string;
  contentSideOffset?: number;
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
  tip = false,
  useTooltipStyles = false,
  defaultStyling = true,
  isPortalled = true,
  contentSideOffset = 2,
  triggerStyles,
  contentStyles,
}) => {
  const content = (
    <RadixPopover.Content
      sideOffset={contentSideOffset}
      side={contentSide}
      align={contentAlign}
      avoidCollisions={avoidCollisions}
      className={classNames(styles.content, {
        [styles.tooltipContent]: useTooltipStyles,
        [contentStyles]: contentStyles,
      })}
    >
      {children}
      {tip && <RadixPopover.Arrow />}
    </RadixPopover.Content>
  );
  return (
    <div className={classNames({ [styles.container]: defaultStyling })}>
      <RadixPopover.Root
        modal={isModal}
        {...(typeof open !== 'undefined' && { open })}
        {...(onOpenChange && { onOpenChange })}
      >
        <RadixPopover.Trigger aria-label="Open popover" asChild>
          <span
            className={classNames(styles.trigger, {
              [triggerStyles]: triggerStyles,
            })}
          >
            {trigger}
          </span>
        </RadixPopover.Trigger>
        {isPortalled ? <RadixPopover.Portal>{content}</RadixPopover.Portal> : content}
      </RadixPopover.Root>
    </div>
  );
};

export default Popover;
