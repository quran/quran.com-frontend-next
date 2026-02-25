import React, { ReactNode, useCallback, useState } from 'react';

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
  isTooltipOpen?: boolean;
  triggerStyles?: string;
  contentStyles?: string;
  isContainerSpan?: boolean;
  tooltipType?: TooltipType;
  icon?: ReactNode;
  onIconClick?: () => void;
  iconAriaLabel?: string;
  shouldContentBeClickable?: boolean;
  useTooltipStyles?: boolean;
  suffixContent?: ReactNode;
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
  isTooltipOpen,
  triggerStyles,
  contentStyles,
  isContainerSpan = false,
  tooltipType,
  icon,
  onIconClick,
  iconAriaLabel,
  shouldContentBeClickable,
  useTooltipStyles = true,
  suffixContent,
}: Props): JSX.Element => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handlePopoverOpenChange = useCallback(
    (open: boolean) => {
      setIsPopoverOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  // When suffixContent is present (e.g. reading mode 3-dots) and the Popover is active
  // (opened via click/tap), suppress the Tooltip to avoid duplicate overlays.
  // Without suffixContent (e.g. translation mode), preserve the original behavior
  // where isOpen can force both Tooltip and Popover open simultaneously.
  const effectiveTooltipOpen = suffixContent && isPopoverOpen ? undefined : isTooltipOpen ?? isOpen;

  return (
    <Popover
      open={isOpen}
      triggerStyles={triggerStyles}
      contentStyles={contentStyles}
      contentSide={contentSide}
      useTooltipStyles={useTooltipStyles}
      onOpenChange={handlePopoverOpenChange}
      defaultStyling={defaultStyling}
      isContainerSpan={isContainerSpan}
      {...(tooltipType && { tooltipType })}
      {...(icon && { icon })}
      {...(onIconClick && { onIconClick })}
      {...(iconAriaLabel && { iconAriaLabel })}
      {...(shouldContentBeClickable && { shouldContentBeClickable })}
      {...(suffixContent && { suffixContent })}
      trigger={
        <Tooltip
          open={effectiveTooltipOpen}
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
          {...(suffixContent && { suffixContent })}
        >
          {children}
        </Tooltip>
      }
      tip={tip}
    >
      {content}
    </Popover>
  );
};

export default HoverablePopover;
