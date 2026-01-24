import React, { ReactNode } from 'react';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import classNames from 'classnames';

import styles from './Tooltip.module.scss';

export enum TooltipType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  SECONDARY = 'secondary',
  INFO = 'info',
}

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
  text: ReactNode;
  children: ReactNode | ReactNode[];
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  contentSide?: ContentSide;
  contentAlign?: ContentAlign;
  avoidCollisions?: boolean;
  tip?: boolean;
  delay?: number;
  invertColors?: boolean;
  centerText?: boolean;
  type?: TooltipType;
  icon?: ReactNode;
  onIconClick?: () => void;
  iconAriaLabel?: string;
  shouldContentBeClickable?: boolean;
}

const Tooltip: React.FC<Props> = ({
  text,
  children,
  onOpenChange,
  open,
  type,
  contentSide = ContentSide.BOTTOM,
  contentAlign = ContentAlign.CENTER,
  avoidCollisions = true,
  delay = 400,
  tip = true,
  invertColors = true,
  centerText = true,
  icon,
  onIconClick,
  iconAriaLabel,
  shouldContentBeClickable = false,
}) => (
  <RadixTooltip.Root
    delayDuration={delay}
    {...(typeof open !== 'undefined' && { open })}
    {...(onOpenChange && { onOpenChange })}
  >
    <RadixTooltip.Trigger aria-label="Open tooltip" asChild>
      <span className={styles.trigger}>{children}</span>
    </RadixTooltip.Trigger>
    <RadixTooltip.Content
      sideOffset={2}
      side={contentSide}
      align={contentAlign}
      avoidCollisions={avoidCollisions}
      className={classNames(styles.content, {
        [styles.noInverse]: invertColors === false,
        [styles.noCenter]: centerText === false,
        [styles.success]: type === TooltipType.SUCCESS,
        [styles.warning]: type === TooltipType.WARNING,
        [styles.error]: type === TooltipType.ERROR,
        [styles.secondary]: type === TooltipType.SECONDARY,
        [styles.info]: type === TooltipType.INFO,
      })}
    >
      {shouldContentBeClickable ? (
        <div
          role="button"
          tabIndex={0}
          className={styles.clickableContent}
          onClick={(e) => {
            e.stopPropagation();
            onIconClick?.();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onIconClick?.();
            }
          }}
          aria-label={iconAriaLabel}
        >
          {icon && <span className={styles.icon}>{icon}</span>}
          {text}
        </div>
      ) : (
        <>
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
          {text}
        </>
      )}
      {tip && <RadixTooltip.Arrow />}
    </RadixTooltip.Content>
  </RadixTooltip.Root>
);

export default Tooltip;
