import { useEffect } from 'react';

/**
 * Custom hook that triggers a callback function when the window regains focus
 * or when the network reconnects.
 *
 * This hook is designed to work with useSWRInfinite as a replacement for the built-in
 * revalidateOnFocus and revalidateOnReconnect options to avoid performance issues.
 *
 * Background:
 * When using useSWRInfinite with revalidateAll: true, all pages are revalidated
 * every time a new page is loaded, causing N(N+1)/2 requests for N pages.
 * Reference: https://github.com/vercel/swr/issues/590
 *
 * Solution:
 * This hook allows manual control over when revalidation occurs (on focus/reconnect)
 * without triggering revalidation on every page load. By passing the mutate function
 * from useSWRInfinite, we can revalidate all pages only when the user refocuses
 * or reconnects, avoiding the quadratic request problem during normal pagination.
 *
 * @param {() => void}  callback - Function to call when window refocuses or reconnects
 *                                 (typically the mutate function from useSWRInfinite)
 * @returns {void}
 *
 * @example
 * const { mutate } = useSWRInfinite(getKey, fetcher, {
 *   revalidateOnFocus: false,
 *   revalidateOnReconnect: false,
 * });
 *
 * const mutateCache = useCallback(() => mutate(), [mutate]);
 * useRefocusAndReconnect(mutateCache);
 */
const useRefocusAndReconnect = (callback: () => void): void => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        callback();
      }
    };

    const handleOnline = () => {
      callback();
    };

    // Listen for visibility changes, window focus and network reconnection
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [callback]);
};

export default useRefocusAndReconnect;
