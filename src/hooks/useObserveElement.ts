import { RefObject, useEffect } from 'react';

/**
 * This is a hook that is mean to be used in combination with {@see useGlobalIntersectionObserver}
 * that will use the global observer that had been created by the above hook to observe an element.
 *
 * @param {RefObject<Element>} elementRef the ref of the object that will be observed.
 * @param {string} observerId the name of the global observer that the element wants to use.
 */
const useObserveElement = (elementRef: RefObject<Element>, observerId: string) => {
  useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;
    if (!hasIOSupport || !node) return undefined;

    // in-case useGlobalIntersectionObserver hasn't been used.
    if (window[observerId]) {
      window[observerId].observe(node);
    }
    return () => {
      if (window[observerId]) {
        window[observerId].unobserve(node);
      }
    };
  }, [elementRef, observerId]);
};

export default useObserveElement;
