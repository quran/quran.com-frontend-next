import { useLayoutEffect } from 'react';

/**
 * This is needed to avoid having the warning that useLayoutEffect
 * does nothing in SSR. Taken from this thread
 * {@link https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export default typeof window !== 'undefined' ? useLayoutEffect : () => {};
