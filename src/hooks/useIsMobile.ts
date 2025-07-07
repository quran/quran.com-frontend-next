import { useState, useEffect } from 'react';

import { isMobile } from '@/utils/responsive';

/**
 * A hook that safely detects if the current viewport is mobile-sized.
 * Handles SSR by returning false on server and updating on client after hydration.
 * Also listens for window resize events to update the state.
 *
 * @returns {boolean} True if the viewport is mobile-sized, false otherwise
 */
const useIsMobile = (): boolean => {
  // Use a function for the initial state to correctly evaluate on client side
  // during hydration, but safely handle SSR
  const [isMobileView, setIsMobileView] = useState<boolean>(() => {
    // During SSR, there is no window object
    if (typeof window === 'undefined') return false;
    // On client, immediately return the correct value
    return isMobile();
  });

  useEffect(() => {
    // This will run after hydration and update the state if needed
    setIsMobileView(isMobile());

    const handleResize = () => {
      setIsMobileView(isMobile());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobileView;
};

export default useIsMobile;
