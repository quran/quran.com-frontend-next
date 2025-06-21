/**
 * A hook that returns whether the code is running on the client or not.
 * Useful for avoiding hydration mismatches in Next.js when using client-side only code.
 *
 * @returns {boolean} True if the code is running on the client, false otherwise
 */
declare const useIsClient: () => boolean;

export default useIsClient;
