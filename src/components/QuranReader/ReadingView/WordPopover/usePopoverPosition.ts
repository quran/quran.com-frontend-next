/* eslint-disable react-func/max-lines-per-function */
import { useState, useCallback, useEffect, RefObject, useMemo } from 'react';

import { PopoverMenuExpandDirection } from '@/components/dls/PopoverMenu/PopoverMenu';

// Constants for popover positioning
const POPOVER_WIDTH = 228; // Width of the popover in pixels
const BASE_MARGIN = 20; // Base margin to ensure some spacing
const POPUP_HEIGHT = 256; // Height of the popover in pixels

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
}

interface UsePopoverPositionResult {
  popoverDirection: PopoverMenuExpandDirection;
  hasEnoughHorizontalSpace: boolean;
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
}: UsePopoverPositionProps): UsePopoverPositionResult => {
  const [popoverDirection, setPopoverDirection] = useState<PopoverMenuExpandDirection>(
    PopoverMenuExpandDirection.BOTTOM,
  );
  const [hasEnoughHorizontalSpace, setHasEnoughHorizontalSpace] = useState(true);

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

      const contentContainer = document.querySelector('.container');
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
    [],
  );

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

    /**
     * Calculate available space on each side of the word
     * @description Determines how much space is available for the popover on each side
     */
    const spaceOnLeft = wordLeft;
    const spaceOnRight = window.innerWidth - wordRight;

    /**
     * Determine which side has more space for optimal positioning
     * @description Compares available space and decides which side to show the popover
     */
    const shouldShowOnRight = spaceOnRight < spaceOnLeft;

    /**
     * Determine vertical position relative to container
     * @description Checks if the word is in the top or bottom half of the container
     */
    const wordMiddleY = wordRect.top + wordRect.height / 2;
    const isInTopHalf = wordMiddleY < containerMiddleY;

    // Get container width from the positions object
    const containerWidth = containerRight - containerLeft;

    // Calculate total available horizontal space
    const totalHorizontalSpace = window.innerWidth - containerWidth;
    const minRequiredSpace = POPOVER_WIDTH * 2; // Need at least twice the popover width for horizontal positioning

    // Check if we have enough horizontal space for left/right positioning
    const enoughSpace = totalHorizontalSpace >= minRequiredSpace;

    // Store this value in state so we can use it in the render function
    setHasEnoughHorizontalSpace(enoughSpace);

    // Set direction based on available space
    let finalDirection;

    if (enoughSpace) {
      // If we have enough space, use left/right positioning
      finalDirection = shouldShowOnRight
        ? PopoverMenuExpandDirection.RIGHT
        : PopoverMenuExpandDirection.LEFT;
    } else {
      // If not enough horizontal space, default to bottom direction
      finalDirection = PopoverMenuExpandDirection.BOTTOM;
    }

    // Set the final direction
    setPopoverDirection(finalDirection);

    // Calculate and set the appropriate margin for horizontal positioning
    if (shouldShowOnRight) {
      // Horizontal positioning for right side
      const distanceToRightEdge = containerRight - wordRight;
      const marginLeft = BASE_MARGIN + distanceToRightEdge;
      document.documentElement.style.setProperty('--popover-margin-left', `${marginLeft}px`);
    } else {
      // Horizontal positioning for left side
      const distanceToLeftEdge = wordLeft - containerLeft;
      // For the left side, we need to account for the popover width
      const marginLeft = BASE_MARGIN + distanceToLeftEdge + POPOVER_WIDTH;
      document.documentElement.style.setProperty('--popover-margin-left', `${-marginLeft}px`);
    }

    // Calculate and set vertical margins based on word position
    // Reset both margin-top and margin-bottom first
    document.documentElement.style.setProperty('--popover-margin-top', '0');

    // Apply vertical margin based on position in the page
    if (!isInTopHalf) {
      // Word is in bottom half, add margin-top to push popover up
      document.documentElement.style.setProperty('--popover-margin-top', `${-POPUP_HEIGHT}px`);
    }
  }, [isMenuOpened, wordRef, getContainerAndWordPositions]);

  const result = useMemo(
    () => ({
      popoverDirection,
      hasEnoughHorizontalSpace,
    }),
    [popoverDirection, hasEnoughHorizontalSpace],
  );

  // Run the calculation when the menu opens or the window resizes
  useEffect(() => {
    calculatePopoverPosition();

    // Also recalculate on window resize
    window.addEventListener('resize', calculatePopoverPosition);
    return () => {
      window.removeEventListener('resize', calculatePopoverPosition);
    };
  }, [calculatePopoverPosition, isMenuOpened]);

  return result;
};

export default usePopoverPosition;
