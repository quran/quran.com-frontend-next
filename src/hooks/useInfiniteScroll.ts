import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

const useInfiniteScroll = <T extends Element = HTMLDivElement>({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '0px 0px 100px 0px',
}: UseInfiniteScrollOptions) => {
  const loadMoreTriggerRef = useRef<T | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore],
  );

  useEffect(() => {
    const element = loadMoreTriggerRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin,
      threshold,
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, [handleIntersection, rootMargin, threshold]);

  return loadMoreTriggerRef;
};

export default useInfiniteScroll;
