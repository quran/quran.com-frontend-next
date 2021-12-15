import { useCallback, useEffect, useRef, useMemo } from 'react';

import throttle from 'lodash/throttle';

export enum ScrollDirection {
  Down = 'down',
  Up = 'up',
}

const DEFAULT_THROTTLING_WAIT_TIME_MS = 80;

/**
 * A hook that detects scrolling and determines whether
 * the user is scrolling up and down and passes it to the
 * callback.
 *
 * @param {direction: ScrollDirection, position: number) => void} onDirectionChange
 * @param {number} throttlingWaitTime The number of milliseconds to throttle callback invocations to.
 */
const useScrollDirection = (
  onDirectionChange: (direction: ScrollDirection, position: number) => void,
  throttlingWaitTime: number = DEFAULT_THROTTLING_WAIT_TIME_MS,
) => {
  // useRef is used instead of useState to avoid having to re-render on every scroll.
  const lastYPosition = useRef(0);

  /*
    When the window scrolls, we check the new Y position against the
    old value:
    - If it's higher, it means the user is scrolling down.
    - If not, the user is scrolling up.
  */
  const onScroll = useCallback(() => {
    const newYPosition = window.pageYOffset;
    onDirectionChange(
      lastYPosition.current < newYPosition ? ScrollDirection.Down : ScrollDirection.Up,
      newYPosition,
    );
    lastYPosition.current = newYPosition;
  }, [onDirectionChange]);

  const onScrollThrottled = useMemo(
    () => throttle(onScroll, throttlingWaitTime),
    [onScroll, throttlingWaitTime],
  );

  // bind the scroll listener on mount and un-bind it on un-mounting.
  useEffect(() => {
    window.addEventListener('scroll', onScrollThrottled);
    return () => {
      window.removeEventListener('scroll', onScrollThrottled);
    };
  }, [onScrollThrottled]);
};

export default useScrollDirection;
