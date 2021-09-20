import { RefObject, useEffect, useState } from 'react';

function useIntersectionObserver(
  elementRef: RefObject<Element>,
  { threshold = 1, root = null, rootMargin = '0%' }: IntersectionObserverInit,
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const updateEntry = ([newEntry]: IntersectionObserverEntry[]): void => {
    setEntry(newEntry);
  };

  useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !node) return undefined;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => {
      return observer.disconnect();
    };
  }, [elementRef, threshold, root, rootMargin]);

  return entry;
}

export default useIntersectionObserver;
