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
    if (typeof window !== 'undefined') {
      let url = relativeUrl;
      let isFirstParameter = true;
      Object.keys(params).forEach((parameter) => {
        const parameterValue = params[parameter];
        // if the value of the parameter exists
        if (parameterValue) {
          url = `${url}${isFirstParameter ? '?' : '&'}${parameter}=${parameterValue}`;
          isFirstParameter = false;
        }
      });
      window.history.replaceState({ ...window.history.state, as: url, url }, '', url);
    }
  }, [relativeUrl, params]);
};

export default useAddQueryParamsToUrl;
