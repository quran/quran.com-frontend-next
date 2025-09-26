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
  isOpen?: boolean;
  isModal?: boolean;
  contentSide?: ContentSide;
  contentAlign?: ContentAlign;
  hasTip?: boolean;
  shouldAvoidCollisions?: boolean;
  shouldUseTooltipStyles?: boolean;
  hasDefaultStyling?: boolean;
  isPortalled?: boolean;
  triggerStyles?: string;
  contentStyles?: string;
  contentSideOffset?: number;
  isContainerSpan?: boolean;
}

const Popover: React.FC<Props> = ({
  children,
  trigger,
  onOpenChange,
  isOpen,
  isModal = false,
  contentSide = ContentSide.BOTTOM,
  contentAlign = ContentAlign.CENTER,
  shouldAvoidCollisions = true,
  hasTip = false,
  shouldUseTooltipStyles = false,
  hasDefaultStyling = true,
  isPortalled = true,
  contentSideOffset = 2,
  triggerStyles,
  contentStyles,
  isContainerSpan = false,
}) => {
  const content = (
    <RadixPopover.Content
      sideOffset={contentSideOffset}
      side={contentSide}
      align={contentAlign}
      avoidCollisions={shouldAvoidCollisions}
      className={classNames(styles.content, {
        [styles.tooltipContent]: shouldUseTooltipStyles,
        [contentStyles]: contentStyles,
      })}
    >
      {children}
      {hasTip && <RadixPopover.Arrow />}
    </RadixPopover.Content>
  );

  const containerChild = (
    <RadixPopover.Root
      modal={isModal}
      {...(typeof isOpen !== 'undefined' && { open: isOpen })}
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
  );

  if (isContainerSpan) {
    return (
      <span className={classNames({ [styles.container]: hasDefaultStyling })}>
        {containerChild}
      </span>
    );
  }

  return (
    <div className={classNames({ [styles.container]: hasDefaultStyling })}>{containerChild}</div>
  );
};

export default Popover;
