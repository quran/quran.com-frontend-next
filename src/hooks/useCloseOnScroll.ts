import { useEffect, useRef } from 'react';

const DEFAULT_SCROLL_THRESHOLD = 50;

/**
 * Hook that triggers a close callback when the user scrolls beyond a threshold.
 * Useful for closing dropdowns/popovers when the user starts scrolling the page.
 */
const useCloseOnScroll = (
  isOpen: boolean,
  onClose: () => void,
  threshold: number = DEFAULT_SCROLL_THRESHOLD,
) => {
  const scrollStartPosition = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) return undefined;

    scrollStartPosition.current = window.scrollY;

    const handleScroll = () => {
      const scrollDelta = Math.abs(window.scrollY - scrollStartPosition.current);
      if (scrollDelta > threshold) {
        onClose();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, onClose, threshold]);
};

export default useCloseOnScroll;
