import { useLayoutEffect } from 'react';

/**
 * This is needed to avoid having the following warning:
 *      Warning: useLayoutEffect does nothing on the server, because its effect cannot be encoded into the server renderer's output format.
 * The solution is inspired by this thread
 * {@link https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85}
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export default typeof window !== 'undefined' ? useLayoutEffect : () => {};
