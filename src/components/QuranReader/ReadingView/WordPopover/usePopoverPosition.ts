/* eslint-disable max-lines */
import { useState, useCallback, useEffect, RefObject, useMemo } from 'react';

import { PopoverMenuExpandDirection } from '@/components/dls/PopoverMenu/PopoverMenu';
import useWindowResizeListener from '@/hooks/useWindowResizeListener';
import { getCSSVariableValue } from '@/utils/dom/cssVariables';

// Get dimensions from CSS variables with fallbacks
const getPopoverWidth = (): number => getCSSVariableValue('--popover-width', 228);
const getPopoverHeight = (): number => getCSSVariableValue('--popover-height', 356);
const BASE_MARGIN = 20;

interface ContainerAndWordPositions {
  wordRect: DOMRect;
  containerLeft: number;
  containerRight: number;
  containerTop: number;
  containerBottom: number;
  containerMiddleY: number;
}

interface UsePopoverPositionProps {
  wordRef: RefObject<HTMLDivElement>;
  isMenuOpened: boolean;
  containerSelector?: string; // Optional selector for the container
}

interface UsePopoverPositionResult {
  popoverDirection: PopoverMenuExpandDirection;
  hasEnoughHorizontalSpace: boolean;
  marginLeft: string;
  marginTop: string;
}

/**
 * Custom hook to calculate and manage popover positioning
 * @param {UsePopoverPositionProps} props - The hook properties
 * @param {UsePopoverPositionProps.wordRef} props.wordRef - Reference to the word element
 * @param {UsePopoverPositionProps.isMenuOpened} props.isMenuOpened - Whether the menu is currently open
 * @returns {UsePopoverPositionResult} Object containing popover direction and space availability
 */
const usePopoverPosition = ({
  wordRef,
  isMenuOpened,
  containerSelector = '#quran-reader-container',
}: UsePopoverPositionProps): UsePopoverPositionResult => {
  const [popoverDirection, setPopoverDirection] = useState<PopoverMenuExpandDirection>(
    PopoverMenuExpandDirection.BOTTOM,
  );
  const [hasEnoughHorizontalSpace, setHasEnoughHorizontalSpace] = useState(true);
  const [marginLeft, setMarginLeft] = useState('0px');
  const [marginTop, setMarginTop] = useState('0px');

  /**
   * Gets the positions of the word and its container
   * @param {HTMLElement} wordElement - The word element to get positions for
   * @returns {ContainerAndWordPositions | null} The container and word positions or null if not found
   */
  const getContainerAndWordPositions = useCallback(
    (wordElement: HTMLElement): ContainerAndWordPositions | null => {
      const wordRect = wordElement.getBoundingClientRect();
      const pageElement = wordElement.closest('[id^="page-"]');
      if (!pageElement) return null;

      const contentContainer = document.getElementById(containerSelector);
      const contentRect = contentContainer ? contentContainer.getBoundingClientRect() : null;
      const containerRect = contentRect || pageElement.getBoundingClientRect();
      const containerWidth = containerRect.width;

      const containerLeft = (window.innerWidth - containerWidth) / 2;
      const containerRight = containerLeft + containerWidth;

      const containerHeight = containerRect.height;
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;
      const containerMiddleY = containerTop + containerHeight / 2;

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
   * Determines if the popover should show on the right side based on available space
   * @param {number} wordLeft - Left position of the word
   * @param {number} wordRight - Right position of the word
   * @returns {boolean} Whether the popover should show on the right side
   */
  const determineShouldShowOnRight = useCallback((wordLeft: number, wordRight: number): boolean => {
    const spaceOnLeft = window.innerWidth - wordLeft;
    const spaceOnRight = wordRight;
    return spaceOnRight > spaceOnLeft;
  }, []);

  /**
   * Determines if there is enough horizontal space for left/right positioning
   * @param {number} containerWidth - Width of the container
   * @returns {boolean} Whether there is enough horizontal space
   */
  const checkHasEnoughHorizontalSpace = useCallback((containerWidth: number): boolean => {
    const totalHorizontalSpace = window.innerWidth - containerWidth;
    const popoverWidth = getPopoverWidth();
    const minRequiredSpace = popoverWidth * 2; // Need at least twice the popover width
    return totalHorizontalSpace >= minRequiredSpace;
  }, []);

  /**
   * Determines the optimal direction for the popover
   * @param {boolean} enoughSpace - Whether there is enough horizontal space
   * @param {boolean} shouldShowOnRight - Whether the popover should show on the right side
   * @returns {PopoverMenuExpandDirection} The optimal direction for the popover
   */
  const determinePopoverDirection = useCallback(
    (enoughSpace: boolean, shouldShowOnRight: boolean): PopoverMenuExpandDirection => {
      if (!enoughSpace) {
        return PopoverMenuExpandDirection.BOTTOM;
      }
      return shouldShowOnRight ? PopoverMenuExpandDirection.RIGHT : PopoverMenuExpandDirection.LEFT;
    },
    [],
  );

  /**
   * Calculates the horizontal margin for the popover
   * @param {boolean} shouldShowOnRight - Whether the popover should show on the right side
   * @param {number} wordLeft - Left position of the word
   * @param {number} wordRight - Right position of the word
   * @param {number} containerLeft - Left position of the container
   * @param {number} containerRight - Right position of the container
   * @returns {string} The calculated margin-left value with units
   */
  const calculateHorizontalMargin = useCallback(
    (
      shouldShowOnRight: boolean,
      wordLeft: number,
      wordRight: number,
      containerLeft: number,
      containerRight: number,
    ): string => {
      if (shouldShowOnRight) {
        // Horizontal positioning for right side
        const distanceToRightEdge = containerRight - wordRight;
        const marginLeftValue = BASE_MARGIN + distanceToRightEdge;
        return `${marginLeftValue}px`;
      }

      // Horizontal positioning for left side
      const distanceToLeftEdge = wordLeft - containerLeft;
      // For the left side, we need to account for the popover width
      const popoverWidth = getPopoverWidth();
      const marginLeftValue = BASE_MARGIN + distanceToLeftEdge + popoverWidth;
      return `${-marginLeftValue}px`;
    },
    [],
  );

  /**
   * Calculates the vertical margin for the popover
   * @param {boolean} isInTopHalf - Whether the word is in the top half of the container
   * @returns {string} The calculated margin-top value with units
   */
  const calculateVerticalMargin = useCallback((isInTopHalf: boolean): string => {
    // Apply vertical margin based on position in the page
    if (!isInTopHalf) {
      // Word is in bottom half, add margin-top to push popover up
      const popoverHeight = getPopoverHeight();
      return `${-popoverHeight}px`;
    }
    // Default margin for words in top half
    return '0px';
  }, []);

  /**
   * Calculate the position of the popover based on the word's position
   * @description Determines the optimal direction for the popover and sets CSS variables for positioning
   * @returns {void}
   */
  const calculatePopoverPosition = useCallback(() => {
    if (!wordRef.current || !isMenuOpened) return;

    const positions = getContainerAndWordPositions(wordRef.current);
    if (!positions) return;

    const { wordRect, containerLeft, containerRight, containerMiddleY } = positions;

    // Calculate the word's position relative to the viewport and container
    const wordLeft = wordRect.left;
    const wordRight = wordRect.right;
    const wordMiddleY = wordRect.top + wordRect.height / 2;

    // Determine positioning parameters
    const isInTopHalf = wordMiddleY > containerMiddleY;
    const containerWidth = containerRight - containerLeft;
    const shouldShowOnRight = determineShouldShowOnRight(wordLeft, wordRight);
    const enoughSpace = checkHasEnoughHorizontalSpace(containerWidth);

    // Update state and set direction
    setHasEnoughHorizontalSpace(enoughSpace);
    const finalDirection = determinePopoverDirection(enoughSpace, shouldShowOnRight);
    setPopoverDirection(finalDirection);

    // Calculate margins
    const calculatedMarginLeft = calculateHorizontalMargin(
      shouldShowOnRight,
      wordLeft,
      wordRight,
      containerLeft,
      containerRight,
    );
    const calculatedMarginTop = calculateVerticalMargin(isInTopHalf);

    // Update state with calculated margins
    setMarginLeft(calculatedMarginLeft);
    setMarginTop(calculatedMarginTop);
  }, [
    isMenuOpened,
    wordRef,
    getContainerAndWordPositions,
    determineShouldShowOnRight,
    checkHasEnoughHorizontalSpace,
    determinePopoverDirection,
    calculateHorizontalMargin,
    calculateVerticalMargin,
  ]);

  const result = useMemo(
    () => ({
      popoverDirection,
      hasEnoughHorizontalSpace,
      marginLeft,
      marginTop,
    }),
    [popoverDirection, hasEnoughHorizontalSpace, marginLeft, marginTop],
  );

  // Run the calculation when the menu opens
  useEffect(() => {
    calculatePopoverPosition();
  }, [calculatePopoverPosition, isMenuOpened]);

  // Use debounced window resize listener for better performance
  useWindowResizeListener(calculatePopoverPosition, 200, [calculatePopoverPosition, isMenuOpened]);

  return result;
};

export default usePopoverPosition;
