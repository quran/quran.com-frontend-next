import { useEffect } from 'react';

/**
 * A hook that appends query parameters to the url. We could've used shallow routing for Next.js
 * but it causes re-rendering to the whole app @see https://github.com/vercel/next.js/discussions/18072
 *
 * @param {string} relativeUrl the relative url e.g. '/search' for the search page.
 * @param {Record<string, unknown>} params a map of each parameter and its value that we will listen to and in the event of changing any of them, we will re-generate the url.
 */
const useAddQueryParamsToUrl = (relativeUrl: string, params: Record<string, unknown>) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Preserve the language prefix from the current URL
    const currentPath = window.location.pathname;
    const languageMatch = currentPath.match(/^\/([a-z]{2})\//);
    const languagePrefix = languageMatch ? `/${languageMatch[1]}` : '';

    // Build the full URL with language prefix
    const baseUrl = `${languagePrefix}${relativeUrl}`;
    const url = buildUrlWithParams(baseUrl, params);

    const currentUrl = `${window.location.pathname}${window.location.search}`;

    // Skip if the url is the same (no need to push state)
    if (currentUrl === url) {
      return;
    }

    const historyState = { ...window.history.state, as: url, url };
    // Use pushState to preserve browser history navigation
    // This ensures the back button works correctly through all navigation steps
    window.history.pushState(historyState, '', url);
  }, [relativeUrl, params]);
};

export default useAddQueryParamsToUrl;
