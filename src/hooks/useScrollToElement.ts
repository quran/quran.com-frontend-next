import { useRef, RefObject } from 'react';

/**
 * A hook that scrolls to a specific element in the DOM.
 * The scrolling will only happen when executeScroll function
 * is invoked.
 *
 * @param {ScrollIntoViewOptions} options
 * @returns {[() => void, RefObject<T>]}
 */
export const useScrollToElement = <T extends HTMLElement>(
  options?: ScrollIntoViewOptions,
): [() => void, RefObject<T>] => {
  const elementRef = useRef<T>(null);
  // a function that will be invoked by the component using this hook to scroll to the element being referenced (if found).
  const executeScroll = (): void => {
    // only scroll when the ref has a value
    if (elementRef.current) {
      elementRef.current.scrollIntoView(options);
    }
  };

  return [executeScroll, elementRef];
};

export const SMOOTH_SCROLL_TO_CENTER = {
  block: 'center', // 'block' relates to vertical alignment. see: https://stackoverflow.com/a/48635751/1931451 for nearest.
  behavior: 'smooth',
} as ScrollIntoViewOptions;

export const SMOOTH_SCROLL_TO_TOP = {
  block: 'start',
  behavior: 'smooth',
} as ScrollIntoViewOptions;

export const SCROLL_TO_NEAREST_ELEMENT = {
  block: 'nearest',
} as ScrollIntoViewOptions;

export default useScrollToElement;
