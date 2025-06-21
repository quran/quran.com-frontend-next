/**
 * A hook that safely detects if the current viewport is mobile-sized.
 * Handles SSR by returning false on server and updating on client after hydration.
 * Also listens for window resize events to update the state.
 *
 * @returns {boolean} True if the viewport is mobile-sized, false otherwise
 */
declare const useIsMobile: () => boolean;

export default useIsMobile;
