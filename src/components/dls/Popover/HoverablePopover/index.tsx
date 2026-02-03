import React, { ReactNode } from 'react';

import Popover, { ContentSide } from '@/dls/Popover';
import Tooltip, { TooltipType } from '@/dls/Tooltip';

interface Props {
  content: ReactNode;
  children: ReactNode | ReactNode[];
  contentSide?: ContentSide;
  tip?: boolean;
  tooltipDelay?: number;
  onOpenChange?: (open: boolean) => void;
  defaultStyling?: boolean;
  isOpen?: boolean;
  triggerStyles?: string;
  contentStyles?: string;
  isContainerSpan?: boolean;
  tooltipType?: TooltipType;
  icon?: ReactNode;
  onIconClick?: () => void;
  iconAriaLabel?: string;
  shouldContentBeClickable?: boolean;
  useTooltipStyles?: boolean;
}

/**
 * A component that combines the functionality of a Popover and a Tooltip together.
 * This is needed to handle the case when we want to show a Tooltip on mobile but
 * since Tooltip is only hoverable and there is no hovering on mobile devices,
 * we provide the same functionality by using a Popover which handles clicking.
 *
 * @param {Props} props
 * @returns {JSX.Element}
 */
const HoverablePopover: React.FC<Props> = ({
  content,
  children,
  onOpenChange,
  contentSide = ContentSide.TOP,
  tip = true,
  tooltipDelay = 0,
  defaultStyling = true,
  isOpen,
  triggerStyles,
  contentStyles,
  isContainerSpan = false,
  tooltipType,
  icon,
  onIconClick,
  iconAriaLabel,
  shouldContentBeClickable,
  useTooltipStyles = true,
}: Props): JSX.Element => (
  <Popover
    open={isOpen}
    triggerStyles={triggerStyles}
    contentStyles={contentStyles}
    contentSide={contentSide}
    useTooltipStyles={useTooltipStyles}
    {...(onOpenChange && { onOpenChange })}
    defaultStyling={defaultStyling}
    isContainerSpan={isContainerSpan}
    {...(tooltipType && { tooltipType })}
    {...(icon && { icon })}
    {...(onIconClick && { onIconClick })}
    {...(iconAriaLabel && { iconAriaLabel })}
    {...(shouldContentBeClickable && { shouldContentBeClickable })}
    trigger={
      <Tooltip
        open={isOpen}
        tip={tip}
        text={content}
        contentSide={contentSide}
        delay={tooltipDelay}
        type={tooltipType}
        {...(onOpenChange && { onOpenChange })}
        {...(icon && { icon })}
        {...(onIconClick && { onIconClick })}
        {...(iconAriaLabel && { iconAriaLabel })}
        {...(shouldContentBeClickable && { shouldContentBeClickable })}
      >
        {children}
      </Tooltip>
    }
    tip={tip}
  >
    {content}
  </Popover>
);

export default HoverablePopover;
