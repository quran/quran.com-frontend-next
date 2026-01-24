import { useCallback, useEffect, useRef } from 'react';

/**
 * A custom hook that provides a safe way to use setTimeout in React components.
 * It automatically cleans up timeouts when the component unmounts or when a new timeout is set.
 *
 * @returns {Function} setSafeTimeout - A function to set a timeout that will be automatically cleaned up
 */
const useSafeTimeout = () => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Sets a timeout that will be automatically cleaned up when the component unmounts
   * or when a new timeout is set using this function.
   *
   * @param {Function} callback - The function to execute after the timeout
   * @param {number} delay - The delay in milliseconds
   * @returns {void}
   */
  const setSafeTimeout = useCallback((callback: () => void, delay: number) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout and store the ID
    timeoutRef.current = setTimeout(callback, delay);
  }, []);

  // Cleanup effect to clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return setSafeTimeout;
};

export default useSafeTimeout;
