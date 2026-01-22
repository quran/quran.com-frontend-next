import { useEffect, useRef, useState } from 'react';

const useShowOnScrollUp = (topThreshold = 20, scrollDistance = 50) => {
  const [show, setShow] = useState(false);
  const scroll = useRef({ lastY: 0, upDistance: 0 });

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = scroll.current.lastY - y;
      scroll.current.upDistance = delta > 0 ? scroll.current.upDistance + delta : 0;
      scroll.current.lastY = y;
      setShow(y > topThreshold && scroll.current.upDistance >= scrollDistance);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [topThreshold, scrollDistance]);

  return show;
};

export default useShowOnScrollUp;
