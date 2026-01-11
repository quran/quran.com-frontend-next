import { useEffect, useRef } from 'react';

import { useDispatch } from 'react-redux';

import { setIsVisible, setLockVisibilityState } from '@/redux/slices/navbar';

const DEFAULT_TIMEOUT_MS = 1000;

/**
 * A custom hook that handles navbar auto-hide functionality during automatic scrolling.
 *
 * This hook centralizes the logic for:
 * 1. Hiding the navbar and locking its visibility state
 * 2. Executing a scroll callback
 * 3. Unlocking the navbar visibility state after a configurable timeout
 *
 * @param {boolean} shouldTrigger - Boolean condition that determines when to trigger the auto-hide behavior
 * @param {() => void} scrollCallback - Function to call for scrolling (e.g., scrollToSelectedItem)
 * @param {React.DependencyList} dependencies - Additional dependencies for the useEffect hook
 * @param {number} timeout - Time in milliseconds to wait before unlocking navbar visibility (default: 1000ms)
 * @returns {React.MutableRefObject<number | undefined>} Reference to the timeout ID for cleanup
 */
const useNavbarAutoHide = (
  shouldTrigger: boolean,
  scrollCallback: () => void,
  dependencies: React.DependencyList = [],
  timeout: number = DEFAULT_TIMEOUT_MS,
) => {
  const dispatch = useDispatch();
  const hideNavbarTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (shouldTrigger) {
      // Hide the navbar and lock its state to avoid showing it on scroll
      dispatch(setIsVisible(false));
      dispatch(setLockVisibilityState(true));

      // Execute the scroll callback
      scrollCallback();

      // Clear any existing timeout
      if (hideNavbarTimeoutRef.current) {
        window.clearTimeout(hideNavbarTimeoutRef.current);
      }

      // Unlock the navbar visibility state after the specified timeout
      hideNavbarTimeoutRef.current = window.setTimeout(() => {
        dispatch(setLockVisibilityState(false));
      }, timeout);
    }

    // Cleanup function to clear timeout and unlock visibility state on unmount or when dependencies change
    return () => {
      if (hideNavbarTimeoutRef.current) {
        window.clearTimeout(hideNavbarTimeoutRef.current);
        // Ensure visibility state is unlocked when component unmounts to prevent getting stuck
        dispatch(setLockVisibilityState(false));
      }
    };
  }, [dispatch, shouldTrigger, scrollCallback, timeout, dependencies]);

  return hideNavbarTimeoutRef;
};

export default useNavbarAutoHide;
