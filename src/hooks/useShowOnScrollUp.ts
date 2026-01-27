import { useEffect, useRef, useState } from 'react';

/*
 * Hook to show an element when scrolling up and hide it near top of page.
 * - topThreshold: Minimum scroll position before showing (default 20px)
 * - scrollDistance: Minimum scroll-up distance to trigger show (default 50px)
 * - hideThreshold: Hide element when within this distance from top (default 100px)
 */
const useShowOnScrollUp = (topThreshold = 20, scrollDistance = 50, hideThreshold = 100) => {
  const [show, setShow] = useState(false);
  const [nearTop, setNearTop] = useState(false);
  const scroll = useRef({ lastY: 0, upDistance: 0 });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = scroll.current.lastY - y;
      scroll.current.upDistance = delta > 0 ? scroll.current.upDistance + delta : 0;
      scroll.current.lastY = y;

      const shouldShow = y > topThreshold && scroll.current.upDistance >= scrollDistance;
      setShow(shouldShow);
      setNearTop(shouldShow && y <= hideThreshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [topThreshold, scrollDistance, hideThreshold]);

  return { show, nearTop };
};

export default useShowOnScrollUp;
