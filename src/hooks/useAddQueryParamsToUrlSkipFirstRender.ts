import { useEffect, useRef } from 'react';

/**
 * A hook that appends query parameters to the url. We could've used shallow routing for Next.js
 * but it causes re-rendering to the whole app @see https://github.com/vercel/next.js/discussions/18072
 *
 * @param {string} relativeUrl the relative url e.g. '/search' for the search page.
 * @param {Record<string, unknown>} params a map of each parameter and its value that we will listen to and in the event of changing any of them, we will re-generate the url.
 */
const useAddQueryParamsToUrlSkipFirstRender = (
  relativeUrl: string,
  params: Record<string, unknown>,
) => {
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip the first render to avoid overwriting URL parameters
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (typeof window !== 'undefined') {
      // Get current URL parameters
      const currentUrl = window.location.href;
      const currentUrlObj = new URL(currentUrl);
      const currentSearchParams = new URLSearchParams(currentUrlObj.search);

      // Only update parameters that have changed
      let needsUpdate = false;
      Object.entries(params).forEach(([parameter, value]) => {
        if (value !== undefined && value !== null) {
          const currentValue = currentSearchParams.get(parameter);
          const newValue = String(value);

          // Only update if the value has changed
          if (currentValue !== newValue) {
            needsUpdate = true;
            currentSearchParams.set(parameter, newValue);
          }
        }
      });

      // Only update the URL if parameters have changed
      if (needsUpdate) {
        const queryString = currentSearchParams.toString();
        const newUrl = `${relativeUrl}${queryString ? `?${queryString}` : ''}`;
        window.history.replaceState(
          { ...window.history.state, as: newUrl, url: newUrl },
          '',
          newUrl,
        );
      }
    }
  }, [relativeUrl, params]);
};

export default useAddQueryParamsToUrlSkipFirstRender;
