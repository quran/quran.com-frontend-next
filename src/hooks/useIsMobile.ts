import { useState, useEffect } from 'react';

import { isMobile, isSmallMobile } from '@/utils/responsive';

export enum MobileSizeVariant {
  SMALL = 'small',
  LARGE = 'large',
}

/**
 * A hook that safely detects if the current viewport is mobile-sized.
 * Starts with a desktop-friendly default to keep SSR/CSR markup aligned
 * and updates on the client immediately after hydration and on resize.
 *
 * @returns {boolean} True if the viewport is mobile-sized, false otherwise
 */
const useIsMobile = (variant?: MobileSizeVariant): boolean => {
  const [isMobileView, setIsMobileView] = useState<boolean>(false);

  useEffect(() => {
    const updateView = () => {
      setIsMobileView(variant === MobileSizeVariant.SMALL ? isSmallMobile() : isMobile());
    };

    updateView();

    window.addEventListener('resize', updateView);

    return () => {
      window.removeEventListener('resize', updateView);
    };
  }, [variant]);

  return isMobileView;
};

export default useIsMobile;
