import { useEffect, useCallback } from 'react';

import useSafeTimeout from './useSafeTimeout';

/**
 * A custom hook that adds a debounced event listener for window resize events.
 * This helps improve performance by preventing excessive calculations during resize operations.
 *
 * @param {Function} callback - The function to call when the window is resized
 * @param {number} delay - The debounce delay in milliseconds
 * @param {Array<any>} dependencies - Additional dependencies for the callback
 */
const useWindowResizeListener = (
  callback: () => void,
  delay = 200,
  dependencies: React.DependencyList = [],
): void => {
  const setSafeTimeout = useSafeTimeout();

  // Create a memoized, debounced version of the callback
  const debouncedCallback = useCallback(() => {
    return () => {
      // Use setSafeTimeout which automatically handles clearing previous timeouts
      setSafeTimeout(() => {
        callback();
      }, delay);
    };
  }, [callback, delay, setSafeTimeout]);

  // Add the event listener with the debounced callback
  useEffect(() => {
    const handleResize = debouncedCallback();

    // Call once on mount to initialize
    callback();

    window.addEventListener('resize', handleResize);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCallback, callback, ...dependencies]);
};

export default useWindowResizeListener;
