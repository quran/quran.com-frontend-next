import { PopoverMenuExpandDirection } from '@/components/dls/PopoverMenu/PopoverMenu';
import { getCSSVariableValue } from '@/utils/dom/cssVariables';
import { Direction } from '@/utils/locale';

// Get dimensions from CSS variables with fallbacks
export const getPopoverWidthFromCSS = (): number => getCSSVariableValue('--popover-width', 228);
export const getPopoverHeightFromCSS = (): number => getCSSVariableValue('--popover-height', 356);
export const POPOVER_SAFETY_MARGIN_PX = 20;

/**
 * Determines if the popover should show on the right side based on available space
 * @param {number} wordLeftPx - Left position of the word in pixels
 * @param {number} wordRightPx - Right position of the word in pixels
 * @returns {boolean} Whether the popover should show on the right side
 */
export const shouldShowOnRight = (wordLeftPx: number, wordRightPx: number): boolean => {
  const spaceOnLeft = window.innerWidth - wordLeftPx;
  const spaceOnRight = wordRightPx;
  return spaceOnRight > spaceOnLeft;
};

/**
 * Determines if there is enough horizontal space for left/right positioning
 * @param {number} containerWidthPx - Width of the container in pixels
 * @returns {boolean} Whether there is enough horizontal space
 */
export const checkHorizontalSpace = (containerWidthPx: number): boolean => {
  const totalHorizontalSpace = window.innerWidth - containerWidthPx;
  const popoverWidth = getPopoverWidthFromCSS();
  const minRequiredSpace = popoverWidth * 2; // Need at least twice the popover width
  return totalHorizontalSpace >= minRequiredSpace;
};

/**
 * Determines the optimal direction for the popover
 * @param {boolean} hasEnoughSpace - Whether there is enough horizontal space
 * @param {boolean} isRightSideBetter - Whether the popover should show on the right side
 * @returns {PopoverMenuExpandDirection} The optimal direction for the popover
 */
export const selectOptimalDirection = (
  hasEnoughSpace: boolean,
  isRightSideBetter: boolean,
): PopoverMenuExpandDirection => {
  if (!hasEnoughSpace) {
    return PopoverMenuExpandDirection.BOTTOM;
  }
  return isRightSideBetter ? PopoverMenuExpandDirection.RIGHT : PopoverMenuExpandDirection.LEFT;
};

/**
 * Calculates the horizontal margin for the popover
 * @param {boolean} isRightSideBetter - Whether the popover should show on the right side
 * @param {number} wordLeftPx - Left position of the word in pixels
 * @param {number} wordRightPx - Right position of the word in pixels
 * @param {number} containerLeftPx - Left position of the container in pixels
 * @param {number} containerRightPx - Right position of the container in pixels
 * @returns {string} The calculated margin-left value with units
 */
export const calculateHorizontalMargin = (
  isRightSideBetter: boolean,
  wordLeftPx: number,
  wordRightPx: number,
  containerLeftPx: number,
  containerRightPx: number,
  direction: Direction = Direction.LTR,
): string => {
  // Get common values used in calculations
  const safetyMargin = POPOVER_SAFETY_MARGIN_PX;
  const popoverWidth = getPopoverWidthFromCSS();

  // For RTL mode, we use different calculations but follow the same pattern
  if (direction === Direction.RTL) {
    // RTL-specific calculations - invert the isRightSideBetter logic for RTL
    if (!isRightSideBetter) {
      // Inverted condition for RTL
      // Horizontal positioning for left side in RTL (which is physically on the right in RTL)
      const distanceToLeftEdge = wordLeftPx - containerLeftPx;
      const marginRightValue = safetyMargin + distanceToLeftEdge;
      return `${marginRightValue}px`;
    }

    // Horizontal positioning for right side in RTL (which is physically on the left in RTL)
    const distanceToRightEdge = containerRightPx - wordRightPx;
    // For the right side in RTL, we need to account for the popover width
    const marginRightValue = safetyMargin + distanceToRightEdge + popoverWidth;
    return `${-marginRightValue}px`;
  }

  // For LTR mode, use the original implementation
  if (isRightSideBetter) {
    // Horizontal positioning for right side
    const distanceToRightEdge = containerRightPx - wordRightPx;
    const marginLeftValue = safetyMargin + distanceToRightEdge;
    return `${marginLeftValue}px`;
  }

  // Horizontal positioning for left side
  const distanceToLeftEdge = wordLeftPx - containerLeftPx;
  // For the left side, we need to account for the popover width
  const marginLeftValue = safetyMargin + distanceToLeftEdge + popoverWidth;
  return `${-marginLeftValue}px`;
};

/**
 * Calculates the vertical margin for the popover
 * @param {boolean} isWordInTopHalf - Whether the word is in the top half of the container
 * @returns {string} The calculated margin-top value with units
 */
export const calculateVerticalMargin = (isWordInTopHalf: boolean): string => {
  const popoverHeight = getPopoverHeightFromCSS();
  // Apply vertical margin based on position in the page
  if (!isWordInTopHalf) {
    return `${-popoverHeight}px`;
  }
  // Default margin for words in top half
  return '0px';
};

/**
 * Data structure containing positioning information for the word and its container
 */
export interface ElementPositioningData {
  wordRect: DOMRect;
  containerLeft: number;
  containerRight: number;
  containerTop: number;
  containerBottom: number;
  containerMiddleY: number;
}
