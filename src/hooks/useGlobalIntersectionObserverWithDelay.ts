/* eslint-disable react-func/max-lines-per-function */
import { useCallback, useRef } from 'react';

import useBrowserLayoutEffect from '@/hooks/useBrowserLayoutEffect';

const isDev = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';

/**
 * Sets a debugging text to element debugger node if we are in a dev environment
 * and the element debugger paragraph node exists.
 *
 * @param {string} text
 * @param {HTMLElement} intersectionDebuggerNode
 *
 */
const setIntersectionDebuggerNodeText = (text: string, intersectionDebuggerNode: HTMLElement) => {
  if (!isDev || !intersectionDebuggerNode) {
    return;
  }
  // eslint-disable-next-line no-param-reassign
  intersectionDebuggerNode.textContent = `OBSERVER DEBUGGER: ${text}`;
};

/**
 * A hook that will create a global observer and inject it into window so that it's
 * globally available. Once it's created, it can be used by any element that would like
 * to be observed using that observer using {@see useObserverElement} hook. This hook
 * is meant to be used for delayed element visibility callback.
 *
 * @param {IntersectionObserverInit} options
 * @param {(element:Element)=>void} onElementVisible
 * @param {string} observerId the name of the observer
 * @param {string} elementIdKey the key of the unique identifier of each element.
 * @param {string} delayForMSKey the key holding the number of milliseconds after which the observer should trigger the callback
 */
const useGlobalIntersectionObserverWithDelay = (
  { threshold = 1, root = null, rootMargin = '0%' }: IntersectionObserverInit,
  onElementVisible: (element: Element) => void,
  observerId: string,
  elementIdKey: string,
  delayForMSKey: string,
) => {
  /**
   * An object that will hold a reference of each unique identifier and
   * the ID of the timeout function that will trigger when the element
   * is visible for delayForMS number of seconds.
   */
  const timeouts = useRef<Map<any, number>>(new Map());
  const updateEntry = useCallback(
    (entries: IntersectionObserverEntry[]): void => {
      entries.forEach((visibleEntry) => {
        let elementIntersectionDebuggerNode: HTMLElement;
        if (isDev) {
          const nodes = visibleEntry.target.getElementsByClassName('debugger');
          // if at least one debugger node was found (should always be there but just to be extra sure)
          if (nodes.length) {
            elementIntersectionDebuggerNode = nodes[0] as HTMLElement;
          }
        }
        const targetNode = visibleEntry.target as HTMLElement;
        const elementId = targetNode.dataset[elementIdKey];
        const delayForMS = Number(targetNode.dataset[delayForMSKey]);
        // if the element content container is interacting
        if (visibleEntry.isIntersecting) {
          setIntersectionDebuggerNodeText(
            `Element is fully visible, triggering callback in ${delayForMS / 1000} seconds...`,
            elementIntersectionDebuggerNode,
          );
          // Call the API after delayForMS
          timeouts.current.set(
            elementId,
            window.setTimeout(() => {
              onElementVisible(visibleEntry.target);
              setIntersectionDebuggerNodeText(
                `Element callback triggered`,
                elementIntersectionDebuggerNode,
              );
            }, delayForMS),
          );
        } else {
          // if it's no longer intersecting, clear the timeout
          clearTimeout(timeouts.current.get(elementId));
          /**
           * Delete the timeout function's ID from the global array since it's no longer
           * needed and next time if the same element intersects, a new ID will be generated
           * for that element.
           */
          timeouts.current.delete(elementId);
          setIntersectionDebuggerNodeText(
            `Element is not fully visible, won't trigger callback`,
            elementIntersectionDebuggerNode,
          );
        }
      });
    },
    [delayForMSKey, elementIdKey, onElementVisible],
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
      // manually clear all the timeouts (if any are still around)
      timeouts.current.forEach((value) => {
        clearTimeout(value);
      });
      if (window[observerId]) {
        window[observerId].disconnect();
        window[observerId] = undefined;
      }
    };
  }, [root, rootMargin, threshold, updateEntry, observerId]);
};

export default useGlobalIntersectionObserverWithDelay;
