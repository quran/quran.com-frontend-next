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
  suffixContent?: ReactNode;
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
  suffixContent,
}) => {
  const typeClassNames = {
    [styles.noInverse]: invertColors === false,
    [styles.noCenter]: centerText === false,
    [styles.success]: type === TooltipType.SUCCESS,
    [styles.warning]: type === TooltipType.WARNING,
    [styles.error]: type === TooltipType.ERROR,
    [styles.secondary]: type === TooltipType.SECONDARY,
    [styles.info]: type === TooltipType.INFO,
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIconClick?.();
  };
  const handleIconKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onIconClick?.();
    }
  };

  const innerContent = shouldContentBeClickable ? (
    <div
      role="button"
      tabIndex={0}
      className={styles.clickableContent}
      onClick={handleIconClick}
      onKeyDown={handleIconKeyDown}
      aria-label={iconAriaLabel}
    >
      {text}
      {icon && <span className={styles.icon}>{icon}</span>}
    </div>
  ) : (
    <>
      {text}
      {icon && (
        <span
          className={styles.icon}
          onClick={handleIconClick}
          onKeyDown={handleIconKeyDown}
          role="button"
          tabIndex={0}
          aria-label={iconAriaLabel}
        >
          {icon}
        </span>
      )}
    </>
  );

  return (
    <RadixTooltip.Root
      delayDuration={delay}
      {...(typeof open !== 'undefined' && { open })}
      {...(onOpenChange && { onOpenChange })}
    >
      <RadixTooltip.Trigger aria-label="Open tooltip" asChild>
        <span className={styles.trigger}>{children}</span>
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={2}
          side={contentSide}
          align={contentAlign}
          avoidCollisions={avoidCollisions}
          className={
            suffixContent ? styles.contentWithPrefix : classNames(styles.content, typeClassNames)
          }
        >
          {suffixContent ? (
            <>
              {suffixContent}
              {text && (
                <div className={classNames(styles.content, typeClassNames)}>{innerContent}</div>
              )}
            </>
          ) : (
            innerContent
          )}
          {tip && <RadixTooltip.Arrow />}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};

export default Tooltip;
