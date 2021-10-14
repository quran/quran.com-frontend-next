import { RefObject, useEffect } from 'react';

/**
 * This is a hook that is mean to be used in combination with {@see useGlobalIntersectionObserver}
 * that will use the global observer that had been created by the above hook to observe an element.
 *
 * @param {RefObject<Element>} elementRef the ref of the object that will be observed.
 * @param {string} observerName the name of the global observer that the element wants to use.
 */
const useObserveElement = (elementRef: RefObject<Element>, observerName: string) => {
  useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;
    if (!hasIOSupport || !node) return undefined;

    // in-case useGlobalIntersectionObserver hasn't been used.
    if (window[observerName]) {
      window[observerName].observe(node);
    }
    return () => {
      if (window[observerName]) {
        window[observerName].unobserve(node);
      }
    };
  }, [elementRef, observerName]);
};

export default useObserveElement;
