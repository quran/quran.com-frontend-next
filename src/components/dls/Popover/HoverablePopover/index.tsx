import React, { JSX, ReactNode } from 'react';

import Popover, { ContentSide } from '@/dls/Popover';
import Tooltip from '@/dls/Tooltip';

interface Props {
  content: ReactNode;
  children: ReactNode | ReactNode[];
  contentSide?: ContentSide;
  hasTip?: boolean;
  tooltipDelay?: number;
  onOpenChange?: (open: boolean) => void;
  hasDefaultStyling?: boolean;
  isOpen?: boolean;
  triggerStyles?: string;
  isContainerSpan?: boolean;
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
  hasTip = true,
  tooltipDelay = 0,
  hasDefaultStyling = true,
  isOpen,
  triggerStyles,
  isContainerSpan = false,
}: Props): JSX.Element => (
  <Popover
    isOpen={isOpen}
    triggerStyles={triggerStyles}
    contentSide={contentSide}
    shouldUseTooltipStyles
    {...(onOpenChange && { onOpenChange })}
    hasDefaultStyling={hasDefaultStyling}
    isContainerSpan={isContainerSpan}
    trigger={
      <Tooltip
        isOpen={isOpen}
        hasTip={hasTip}
        text={content}
        contentSide={contentSide}
        delay={tooltipDelay}
        {...(onOpenChange && { onOpenChange })}
      >
        {children}
      </Tooltip>
    }
    hasTip={hasTip}
  >
    {content}
  </Popover>
);

export default HoverablePopover;
