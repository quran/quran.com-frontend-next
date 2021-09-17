import { useState, useEffect } from 'react';

/**
 * A hook that allows to debounce any fast changing value such as text input value.The debounced
 * value will only reflect the latest value when the useDebounce hook has not been called
 * for the specified time period.
 * Code inspiration from https://github.com/xnimorz/use-debounce.
 *
 * @param {T} value the value that will be debounced.
 * @param {number} delay the value of delay in milliseconds before we set the new value as the debounced value.
 * @returns {T}
 */
const useDebounce = <T>(value: T, delay: number): T => {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(
    () => {
      // Update debounced value only after the delay period has elapsed.
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value or delay period change or if unmount happens.
      // This is how we prevent debounced value from updating if value is changed within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay], // Only re-call effect if value or delay changes
  );
  return debouncedValue;
};

export default useDebounce;
