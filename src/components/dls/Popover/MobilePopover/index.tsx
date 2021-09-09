import React, { ReactNode } from 'react';
import Tooltip from 'src/components/dls/Tooltip';
import Popover, { ContentSide } from '..';

interface Props {
  content: ReactNode;
  children: ReactNode | ReactNode[];
  contentSide?: ContentSide;
  tip?: boolean;
  contentClassName?: string;
  tooltipDelay?: number;
  onOpenChange?: (open: boolean) => void;
}

const MobilePopover: React.FC<Props> = ({
  content,
  children,
  contentClassName,
  onOpenChange,
  contentSide = ContentSide.TOP,
  tip = true,
  tooltipDelay = 0,
}) => (
  <Popover
    contentSide={contentSide}
    contentClassName={contentClassName}
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

export default MobilePopover;
