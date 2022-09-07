import { useCallback } from 'react';

import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';

/**
 * A hook that will create a global observer and inject it into window so that it's
 * globally available. Once it's created, it can be used by any element that would like
 * to be observed using that observer using {@see useObserverElement} hook.
 *
 * @param {IntersectionObserverInit} options
 * @param {(element:Element)=>void} onElementVisible
 * @param {string} observerId the name of the observer
 */
const useGlobalIntersectionObserver = (
  { threshold = 1, root = null, rootMargin = '0%' }: IntersectionObserverInit,
  onElementVisible: (element: Element) => void,
  observerId: string,
) => {
  const updateEntry = useCallback(
    (entries: IntersectionObserverEntry[]): void => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((visibleEntry) => {
          onElementVisible(visibleEntry.target);
        });
    },
    [onElementVisible],
  );

  /**
   * We need to assign to window before render is done since we want to the observer to be available by the time rendering is done so that the elements to be observed can use it.
   * {@see https://kentcdodds.com/blog/useeffect-vs-uselayouteffect}
   */
  useBrowserLayoutEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver;
    if (!hasIOSupport) return undefined;

    // no need to create a new observer if it already exists.
    if (!window[observerId]) {
      window[observerId] = new IntersectionObserver(updateEntry, {
        threshold,
        root,
        rootMargin,
      });
    }
    return () => {
      window[observerId].disconnect();
      window[observerId] = undefined;
    };
  }, [root, rootMargin, threshold, updateEntry, observerId]);
};

export default useGlobalIntersectionObserver;
