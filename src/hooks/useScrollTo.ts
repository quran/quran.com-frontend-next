import { useEffect, useRef } from 'react';

const DEFAULT_SCROLL_MARGIN = 300;

/**
 *
 * Scroll to a specific element
 * How to use: pass the returned `selectedItemRef` to the element you want to scroll to
 *
 * @param {Function} scrollAbleParentMapper - A function that returns the scrollable parent of the element.
 * (element that has overflow: auto/scroll)
 * @param {number} scrollMargin - The margin to be added to the scrollable parent.
 * @returns {MutableRefObject} selectedItemRef - React ref
 */
const useScrollTo = (
  scrollAbleParentMapper = (node) => node.parentNode,
  scrollMargin: number = DEFAULT_SCROLL_MARGIN,
) => {
  const selectedItemRef = useRef(null);
  useEffect(() => {
    if (selectedItemRef.current) {
      const scrollAbleParentNode = scrollAbleParentMapper(selectedItemRef.current);
      scrollAbleParentNode.scrollTo(0, selectedItemRef.current.offsetTop - scrollMargin);
    }
  }, [selectedItemRef, scrollMargin, scrollAbleParentMapper]);

  return selectedItemRef;
};

export default useScrollTo;
