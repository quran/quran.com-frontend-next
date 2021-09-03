import React, { ReactNode, useCallback, useEffect, useState, useRef } from 'react';
import * as RadixHoverCard from '@radix-ui/react-hover-card';
import useOutsideClickDetector from 'src/hooks/useOutsideClickDetector';
import styles from './HoverCard.module.scss';

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
  contentSide?: ContentSide;
  contentAlign?: ContentAlign;
  avoidCollisions?: boolean;
  tip?: boolean;
  openDelay?: number;
  closeDelay?: number;
}

const HoverCard: React.FC<Props> = ({
  body,
  children,
  onOpenChange,
  contentSide = ContentSide.BOTTOM,
  contentAlign = ContentAlign.CENTER,
  avoidCollisions = true,
  openDelay = 400,
  closeDelay = 300,
  tip = true,
}) => {
  // we need this to handle on trigger click to support mobile devices since the library doesn't support it out of the box.
  const [isOpened, setIsOpened] = useState(false);
  const containerRef = useRef(null);
  const toggleIsOpened = useCallback(() => {
    setIsOpened((prevIsOpened) => !prevIsOpened);
  }, []);

  const closeHoverCard = useCallback(() => {
    setIsOpened(false);
  }, []);
  useOutsideClickDetector(containerRef, closeHoverCard, true);

  // listen to any changes in isOpened and trigger the onChange callback if it exists.
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpened);
    }
  }, [isOpened, onOpenChange]);

  return (
    <RadixHoverCard.Root
      openDelay={openDelay}
      closeDelay={closeDelay}
      open={isOpened}
      onOpenChange={(open) => {
        setIsOpened(open);
      }}
    >
      <div ref={containerRef}>
        <RadixHoverCard.Trigger as="div" className={styles.trigger} onClick={toggleIsOpened}>
          {children}
        </RadixHoverCard.Trigger>
        <RadixHoverCard.Content
          sideOffset={2}
          side={contentSide}
          align={contentAlign}
          avoidCollisions={avoidCollisions}
          className={styles.content}
        >
          {body}
          {tip && <RadixHoverCard.Arrow />}
        </RadixHoverCard.Content>
      </div>
    </RadixHoverCard.Root>
  );
};

export default HoverCard;
