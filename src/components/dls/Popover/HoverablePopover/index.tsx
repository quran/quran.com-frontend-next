import React, { ReactNode } from 'react';
import Tooltip from 'src/components/dls/Tooltip';
import Popover, { ContentSide } from '..';

interface Props {
  content: ReactNode;
  children: ReactNode | ReactNode[];
  contentSide?: ContentSide;
  tip?: boolean;
  tooltipDelay?: number;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A component that combines the functionality of a Popover and a Tooltip together.
 * This is needed to handle the case when we want to show a Tooltip on mobile but
 * since Tooltip is only hoverable and there is no hovering on mobile devices,
 * we provide the same functionality by using a Popover which handles clicking.
 *
 * @param {Props} props
 */
const HoverablePopover: React.FC<Props> = ({
  content,
  children,
  onOpenChange,
  contentSide = ContentSide.TOP,
  tip = true,
  tooltipDelay = 0,
}) => (
  <Popover
    contentSide={contentSide}
    useTooltipStyles
    {...(onOpenChange && { onOpenChange })}
    trigger={
      <Tooltip
        tip={tip}
        text={content}
        contentSide={contentSide}
        delay={tooltipDelay}
        {...(onOpenChange && { onOpenChange })}
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
