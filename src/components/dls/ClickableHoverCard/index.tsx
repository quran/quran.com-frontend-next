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
  open?: boolean;
  contentSide?: ContentSide;
  contentAlign?: ContentAlign;
  avoidCollisions?: boolean;
  tip?: boolean;
  openDelay?: number;
  closeDelay?: number;
}

const ClickableHoverCard: React.FC<Props> = ({
  body,
  children,
  onOpenChange,
  open,
  contentSide = ContentSide.BOTTOM,
  contentAlign = ContentAlign.CENTER,
  avoidCollisions = true,
  openDelay = 400,
  closeDelay = 300,
  tip = true,
}) => (
  <Popover
    open={open}
    contentSide={contentSide}
    {...(onOpenChange && { onOpenChange })}
    contentAlign={contentAlign}
    avoidCollisions={avoidCollisions}
    trigger={
      <HoverCard
        openDelay={openDelay}
        body={body}
        closeDelay={closeDelay}
        open={open}
        contentSide={contentSide}
        avoidCollisions={avoidCollisions}
        contentAlign={contentAlign}
        tip
        {...(typeof open !== 'undefined' && { open })}
        {...(onOpenChange && { onOpenChange })}
      >
        {children}
      </HoverCard>
    }
    tip={tip}
  >
    {body}
  </Popover>
);

export default ClickableHoverCard;
