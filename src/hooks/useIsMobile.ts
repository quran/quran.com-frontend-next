import { useState, useEffect } from 'react';

import useIsClient from './useIsClient';

import { isMobile } from '@/utils/responsive';

/**
 * A hook that safely detects if the current viewport is mobile-sized.
 * Handles SSR by returning false on server and updating on client after hydration.
 * Also listens for window resize events to update the state.
 *
 * @returns {boolean} True if the viewport is mobile-sized, false otherwise
 */
const useIsMobile = (): boolean => {
  const [isMobileView, setIsMobileView] = useState(false);
  const isClient = useIsClient();

  useEffect(() => {
    // Only run on the client side
    if (isClient) {
      // Set initial mobile state
      setIsMobileView(isMobile());

      // Add resize listener to update mobile state
      const handleResize = () => {
        setIsMobileView(isMobile());
      };

      window.addEventListener('resize', handleResize);

      // Clean up event listener
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
    return undefined; // Return a value for the non-client case
  }, [isClient]);

  // Return false during SSR, actual value on client
  return isClient ? isMobileView : false;
};

export default useIsMobile;
