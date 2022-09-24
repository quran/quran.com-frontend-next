import { useEffect } from 'react';

const useScrollListener = (threshold, onThresholdReached) => {
  useEffect(() => {
    const detectScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = winScroll / height;
      if (scrolled > threshold) {
        onThresholdReached();
      }
    };
    window.addEventListener('scroll', detectScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', detectScroll);
    };
  }, [onThresholdReached, threshold]);
};

export default useScrollListener;
