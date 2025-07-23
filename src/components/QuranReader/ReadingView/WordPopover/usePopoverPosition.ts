/* eslint-disable react-func/max-lines-per-function */
import { useState, useCallback, useLayoutEffect, RefObject, useMemo } from 'react';

import {
  ElementPositioningData,
  calculateHorizontalMargin,
  calculateVerticalMargin,
  checkHorizontalSpace,
  selectOptimalDirection,
  shouldShowOnRight,
} from './popoverPositionUtils';

import { PopoverMenuExpandDirection } from '@/components/dls/PopoverMenu/PopoverMenu';
import useDirection from '@/hooks/useDirection';
import useWindowResizeListener from '@/hooks/useWindowResizeListener';
import { Direction } from '@/utils/locale';

/**
 * Props for the usePopoverPosition hook
 */
interface PopoverPositionHookProps {
  wordRef: RefObject<HTMLDivElement>;
  isMenuOpened: boolean;
  containerSelector?: string; // Optional selector for the container
}

/**
 * Result returned by the usePopoverPosition hook
 */
interface PopoverPositionHookResult {
  popoverDirection: PopoverMenuExpandDirection;
  hasEnoughHorizontalSpace: boolean;
  marginLeft: string;
  marginRight: string;
  marginTop: string;
}

/**
 * Custom hook to calculate and manage popover positioning
 * @param {PopoverPositionHookProps} props - The hook properties
 * @param {RefObject<HTMLDivElement>} props.wordRef - Reference to the word element
 * @param {boolean} props.isMenuOpened - Whether the menu is currently open
 * @param {string} [props.containerSelector] - Optional selector for the container
 * @returns {PopoverPositionHookResult} Object containing popover direction and space availability
 */
const usePopoverPosition = ({
  wordRef,
  isMenuOpened,
  containerSelector,
}: PopoverPositionHookProps): PopoverPositionHookResult => {
  const localeBasedDirection = useDirection() as Direction;
  const [popoverDirection, setPopoverDirection] = useState<PopoverMenuExpandDirection>(
    PopoverMenuExpandDirection.BOTTOM,
  );
  const [hasEnoughSpaceState, setHasEnoughHorizontalSpace] = useState(true);
  const [marginLeft, setMarginLeft] = useState('0px');
  const [marginRight, setMarginRight] = useState('0px');
  const [marginTop, setMarginTop] = useState('0px');

  /**
   * Gets the positions of the word and its container
   * @param wordElement - The word element to get positions for
   * @returns The container and word positions or null if not found
   */
  const getElementPositioningData = useCallback(
    (wordElement: HTMLElement): ElementPositioningData | null => {
      const wordRect = wordElement.getBoundingClientRect();
      const pageElement = wordElement.closest('[id^="page-"]');

      let containerElement: HTMLElement | null = null;
      if (containerSelector) {
        containerElement = document.querySelector(containerSelector);
      }

      if (!pageElement && !containerElement) return null;

      const pageRect = pageElement.getBoundingClientRect();
      const containerRect = containerElement ? containerElement.getBoundingClientRect() : null;
      const rect = containerRect || pageRect;

      // Calculate container edges relative to viewport
      const containerLeft = rect.left;
      const containerRight = rect.right;
      const containerTop = rect.top;
      const containerBottom = rect.bottom;

      // Calculate middle Y position relative to viewport
      const containerMiddleY = window.innerHeight / 2;

      return {
        wordRect,
        containerLeft,
        containerRight,
        containerTop,
        containerBottom,
        containerMiddleY,
      };
    },
    [containerSelector],
  );

  /**
   * Calculate the position of the popover based on the word's position
   * @description Determines the optimal direction for the popover and sets CSS variables for positioning
   */
  const calculatePopoverPosition = useCallback(() => {
    if (!wordRef.current || !isMenuOpened) return;

    const positionData = getElementPositioningData(wordRef.current);
    if (!positionData) return;

    const { wordRect, containerLeft, containerRight, containerMiddleY } = positionData;

    // Calculate container width for horizontal space check
    const containerWidth = containerRight - containerLeft;
    const hasEnoughSpace = checkHorizontalSpace(containerWidth);

    // Determine if right side positioning is better
    const isRightSideBetter = shouldShowOnRight(wordRect.left, wordRect.right);

    // Set the popover direction based on space availability
    const direction = selectOptimalDirection(hasEnoughSpace, isRightSideBetter);
    setPopoverDirection(direction);
    setHasEnoughHorizontalSpace(hasEnoughSpace);

    // Calculate horizontal margin based on direction
    const horizontalMargin = calculateHorizontalMargin(
      isRightSideBetter,
      wordRect.left,
      wordRect.right,
      containerLeft,
      containerRight,
      localeBasedDirection,
    );

    // Apply margin based on text direction
    if (localeBasedDirection === Direction.RTL) {
      setMarginRight(horizontalMargin);
      setMarginLeft('0px');
    } else {
      setMarginLeft(horizontalMargin);
      setMarginRight('0px');
    }

    // Calculate vertical margin based on word position
    // Use the word's center point for more accurate positioning
    const wordCenter = wordRect.top + wordRect.height / 2;
    const isWordInTopHalf = wordCenter < containerMiddleY;

    const verticalMargin = calculateVerticalMargin(isWordInTopHalf);
    setMarginTop(verticalMargin);
  }, [wordRef, isMenuOpened, getElementPositioningData, localeBasedDirection]);

  const result = useMemo(
    () => ({
      popoverDirection,
      hasEnoughHorizontalSpace: hasEnoughSpaceState,
      marginLeft,
      marginRight,
      marginTop,
    }),
    [popoverDirection, hasEnoughSpaceState, marginLeft, marginRight, marginTop],
  );

  // Run the calculation when the menu opens
  // Using useLayoutEffect to prevent visual flickering by ensuring DOM measurements
  // happen synchronously before browser paint
  useLayoutEffect(() => {
    calculatePopoverPosition();
  }, [calculatePopoverPosition]);

  // Use debounced window resize listener for better performance
  useWindowResizeListener(calculatePopoverPosition, 200, [calculatePopoverPosition]);

  return result;
};

export default usePopoverPosition;
