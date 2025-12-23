import { useEffect, useRef } from 'react';

import { buildUrlWithParams } from '@/utils/navigation';

/**
 * A hook that appends query parameters to the url. We could've used shallow routing for Next.js
 * but it causes re-rendering to the whole app @see https://github.com/vercel/next.js/discussions/18072
 *
 * @param {string} relativeUrl the relative url e.g. '/search' for the search page.
 * @param {Record<string, unknown>} params a map of each parameter and its value that we will listen to and in the event of changing any of them, we will re-generate the url.
 */
const useAddQueryParamsToUrl = (relativeUrl: string, params: Record<string, unknown>) => {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use the utility function to build URL with params
    const url = buildUrlWithParams(relativeUrl, params);
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    // Skip if the url is the same (no need to push/replace state)
    if (currentUrl === url) {
      hasInitialized.current = true;
      return;
    }

    const historyState = { ...window.history.state, as: url, url };
    // Only replace the state on the first run, afterwards we push new states
    const historyMethod = hasInitialized.current ? 'pushState' : 'replaceState';
    window.history[historyMethod](historyState, '', url);

    // Mark the initialization as complete
    // so that next time we push a new state instead of replacing it
    hasInitialized.current = true;
  }, [relativeUrl, params]);
};

export default useAddQueryParamsToUrl;
