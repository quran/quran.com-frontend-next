import React, { ReactNode } from 'react';

import * as RadixPopover from '@radix-ui/react-popover';
import classNames from 'classnames';

import styles from './Popover.module.scss';

import { TooltipType } from '@/dls/Tooltip';

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
  isContainerSpan?: boolean;
  tooltipType?: TooltipType;
  icon?: ReactNode;
  onIconClick?: () => void;
  iconAriaLabel?: string;
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
  isContainerSpan = false,
  tooltipType,
  icon,
  onIconClick,
  iconAriaLabel,
}) => {
  const content = (
    <RadixPopover.Content
      sideOffset={contentSideOffset}
      side={contentSide}
      align={contentAlign}
      avoidCollisions={avoidCollisions}
      className={classNames(styles.content, {
        [styles.tooltipContent]: useTooltipStyles,
        [styles.info]: tooltipType === TooltipType.INFO,
        [styles.success]: tooltipType === TooltipType.SUCCESS,
        [contentStyles]: contentStyles,
      })}
    >
      {children}
      {icon && (
        <span
          className={styles.icon}
          onClick={(e) => {
            e.stopPropagation();
            onIconClick?.();
          }}
          role="button"
          tabIndex={0}
          aria-label={iconAriaLabel}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onIconClick?.();
            }
          }}
        >
          {icon}
        </span>
      )}
      {tip && <RadixPopover.Arrow />}
    </RadixPopover.Content>
  );

  const containerChild = (
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
  );

  const containerClass = classNames({
    [styles.container]: defaultStyling,
    [styles.containerInfo]: tooltipType === TooltipType.INFO,
  });

  if (isContainerSpan) {
    return <span className={containerClass}>{containerChild}</span>;
  }

  return <div className={containerClass}>{containerChild}</div>;
};

export default Popover;
