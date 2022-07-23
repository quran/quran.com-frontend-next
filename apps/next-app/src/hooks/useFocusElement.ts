import { useRef, RefObject } from 'react';

/**
 * A hook that focus a referenced element.
 *
 * @param {FocusOptions} options
 * @returns {[() => void, RefObject<T>]}
 */
export const useFocusElement = <T extends HTMLElement>(
  options?: FocusOptions,
): [() => void, RefObject<T>] => {
  const elementRef = useRef<T>(null);
  // a function that will be invoked by the component using this hook to focus the the element being referenced (if found).
  const executeFocus = (): void => {
    // only focus when the ref has a value
    if (elementRef.current) {
      elementRef.current.focus(options);
    }
  };

  return [executeFocus, elementRef];
};

export default useFocusElement;
