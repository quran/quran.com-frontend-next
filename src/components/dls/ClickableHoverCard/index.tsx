import React, { ReactNode } from 'react';

import HoverCard from '@/dls/HoverCard';
import Popover from '@/dls/Popover';

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
  body: ReactNode;
  children: ReactNode | ReactNode[];
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  contentSide?: ContentSide;
  contentAlign?: ContentAlign;
  shouldAvoidCollisions?: boolean;
  hasTip?: boolean;
  openDelay?: number;
  closeDelay?: number;
}

const ClickableHoverCard: React.FC<Props> = ({
  body,
  children,
  onOpenChange,
  isOpen,
  contentSide = ContentSide.BOTTOM,
  contentAlign = ContentAlign.CENTER,
  shouldAvoidCollisions = true,
  openDelay = 400,
  closeDelay = 300,
  hasTip = true,
}) => (
  <Popover
    isOpen={isOpen}
    contentSide={contentSide}
    {...(onOpenChange && { onOpenChange })}
    contentAlign={contentAlign}
    shouldAvoidCollisions={shouldAvoidCollisions}
    trigger={
      <HoverCard
        openDelay={openDelay}
        body={body}
        closeDelay={closeDelay}
        isOpen={isOpen}
        contentSide={contentSide}
        shouldAvoidCollisions={shouldAvoidCollisions}
        contentAlign={contentAlign}
        hasTip
        {...(typeof isOpen !== 'undefined' && { isOpen })}
        {...(onOpenChange && { onOpenChange })}
      >
        {children}
      </HoverCard>
    }
    hasTip={hasTip}
  >
    {body}
  </Popover>
);

export default ClickableHoverCard;
