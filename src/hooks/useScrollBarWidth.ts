import { useEffect } from 'react';

const useScrollBarWidth = () => {
  useEffect(() => {
    const getScrollbarWidth = () => {
      return window.innerWidth - document.documentElement.clientWidth;
    };

    const setScrollbarWidth = () => {
      const scrollbarWidth = getScrollbarWidth();
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    };

    function throttle(fn: () => void, time: number) {
      let timeout = null;
      return () => {
        if (timeout) return;
        timeout = setTimeout(() => {
          fn();
          timeout = null;
        }, time);
      };
    }

    const handleResizeThrottled = throttle(setScrollbarWidth, 500); // Throttle the resize event

    setScrollbarWidth(); // Set the scrollbar width initially

    window.addEventListener('resize', handleResizeThrottled); // Update the scrollbar width when the window is resized

    return () => {
      window.removeEventListener('resize', handleResizeThrottled);
    };
  }, []);
};

export default useScrollBarWidth;
