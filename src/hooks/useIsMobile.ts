import { useState, useEffect } from 'react';

import { isMobile, isSmallMobile } from '@/utils/responsive';

export enum MobileSizeVariant {
  SMALL = 'small',
  LARGE = 'large',
}

/**
 * A hook that safely detects if the current viewport is mobile-sized.
 * Handles SSR by returning false on server and updating on client after hydration.
 * Also listens for window resize events to update the state.
 *
 * @returns {boolean} True if the viewport is mobile-sized, false otherwise
 */
const useIsMobile = (variant?: MobileSizeVariant): boolean => {
  // Use a function for the initial state to correctly evaluate on client side
  // during hydration, but safely handle SSR
  const [isMobileView, setIsMobileView] = useState<boolean>(() => {
    // During SSR, there is no window object
    if (typeof window === 'undefined') return false;
    // On client, immediately return the correct value
    return variant === MobileSizeVariant.SMALL ? isSmallMobile() : isMobile();
  });

  useEffect(() => {
    // This will run after hydration and update the state if needed
    setIsMobileView(variant === MobileSizeVariant.SMALL ? isSmallMobile() : isMobile());

    const handleResize = () => {
      setIsMobileView(variant === MobileSizeVariant.SMALL ? isSmallMobile() : isMobile());
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [variant]);

  return isMobileView;
};

export default useIsMobile;
