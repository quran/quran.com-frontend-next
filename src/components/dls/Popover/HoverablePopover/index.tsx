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
  isContainerSpan?: boolean;
  tooltipType?: TooltipType;
  icon?: ReactNode;
  onIconClick?: () => void;
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
  isContainerSpan = false,
  tooltipType,
  icon,
  onIconClick,
}: Props): JSX.Element => (
  <Popover
    open={isOpen}
    triggerStyles={triggerStyles}
    contentSide={contentSide}
    useTooltipStyles
    {...(onOpenChange && { onOpenChange })}
    defaultStyling={defaultStyling}
    isContainerSpan={isContainerSpan}
    {...(tooltipType && { tooltipType })}
    {...(icon && { icon })}
    {...(onIconClick && { onIconClick })}
    trigger={
      <Tooltip
        open={isOpen}
        tip={tip}
        text={content}
        contentSide={contentSide}
        delay={tooltipDelay}
        {...(onOpenChange && { onOpenChange })}
        {...(tooltipType && { type: tooltipType })}
        {...(icon && { icon })}
        {...(onIconClick && { onIconClick })}
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
