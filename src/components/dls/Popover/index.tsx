import React, { ReactNode } from 'react';

import * as RadixPopover from '@radix-ui/react-popover';
import classNames from 'classnames';

import styles from './Popover.module.scss';
import PopoverContentBody from './PopoverContentBody';

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
  stopPropagation?: boolean;
  tooltipType?: TooltipType;
  icon?: ReactNode;
  onIconClick?: () => void;
  iconAriaLabel?: string;
  shouldContentBeClickable?: boolean;
  suffixContent?: ReactNode;
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
  stopPropagation = false,
  tooltipType,
  icon,
  onIconClick,
  iconAriaLabel,
  shouldContentBeClickable = false,
  suffixContent,
}) => {
  const hasSuffixContent = !!suffixContent;

  const contentClassNames = classNames(styles.content, {
    [styles.tooltipContent]: useTooltipStyles,
    [styles.info]: tooltipType === TooltipType.INFO,
    [styles.success]: tooltipType === TooltipType.SUCCESS,
    [contentStyles]: contentStyles,
  });

  const content = (
    <RadixPopover.Content
      sideOffset={contentSideOffset}
      side={contentSide}
      align={contentAlign}
      avoidCollisions={avoidCollisions}
      className={hasSuffixContent ? styles.contentWithPrefix : contentClassNames}
      {...(stopPropagation && {
        onClick: (e) => e.stopPropagation(),
        onKeyDown: (e) => {
          if (e.key !== 'Tab' && e.key !== 'Escape') e.stopPropagation();
        },
      })}
    >
      {hasSuffixContent ? (
        <>
          {suffixContent}
          {children && (
            <div className={contentClassNames}>
              <PopoverContentBody
                icon={icon}
                onIconClick={onIconClick}
                iconAriaLabel={iconAriaLabel}
                shouldContentBeClickable={shouldContentBeClickable}
              >
                {children}
              </PopoverContentBody>
            </div>
          )}
        </>
      ) : (
        <PopoverContentBody
          icon={icon}
          onIconClick={onIconClick}
          iconAriaLabel={iconAriaLabel}
          shouldContentBeClickable={shouldContentBeClickable}
        >
          {children}
        </PopoverContentBody>
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
