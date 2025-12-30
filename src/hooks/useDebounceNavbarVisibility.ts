import { useState, useEffect } from 'react';

/**
 * Debounce delay for navbar visibility changes to prevent UI flickering
 */
export const DEBOUNCE_DELAY = 150;

/**
 * A custom hook that debounces navbar visibility changes to prevent UI flickering
 *
 * @param {boolean} isVisible - The raw visibility state from Redux
 * @param {boolean} isActive - Additional condition that can force visibility (e.g., onboarding)
 * @returns {boolean} The debounced visibility state
 */
const useDebounceNavbarVisibility = (isVisible: boolean, isActive: boolean): boolean => {
  // Use state to create a debounced version of the navbar visibility
  const [debouncedVisibility, setDebouncedVisibility] = useState(isVisible || isActive);

  // Debounce the navbar visibility changes to prevent UI flickering
  useEffect(() => {
    const rawVisibility = isVisible || isActive;

    // Only update after a delay to prevent rapid toggling
    const timerId = setTimeout(() => {
      setDebouncedVisibility(rawVisibility);
    }, DEBOUNCE_DELAY);

    // Cleanup function to remove the timeout
    return () => clearTimeout(timerId);
  }, [isVisible, isActive]);

  return debouncedVisibility;
};

export default useDebounceNavbarVisibility;
