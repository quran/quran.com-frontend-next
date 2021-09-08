import { useCallback, useEffect, useState } from 'react';

export enum ScrollDirection {
  Down = 'down',
  Up = 'up',
}

/**
 * A hook that detects scrolling and determines whether
 * the user is scrolling up and down and passes it to the
 * callback.
 *
 * @param {direction: ScrollDirection, position: number) => void} onDirectionChange
 */
const useScrollDirection = (
  onDirectionChange: (direction: ScrollDirection, position: number) => void,
) => {
  const [, setLastYPosition] = useState<number>(0);

  /*
    When the window scrolls, we check the new Y position against the
    old value:
    - If it's higher, it means the user is scrolling down.
    - If not, the user is scrolling up.
  */
  const onScroll = useCallback(() => {
    setLastYPosition((lastYPosition) => {
      const newYPosition = window.pageYOffset;
      onDirectionChange(
        lastYPosition < newYPosition ? ScrollDirection.Down : ScrollDirection.Up,
        newYPosition,
      );
      return newYPosition;
    });
  }, [onDirectionChange]);

  // bind the scroll listener on mount and un-bind it on un-mounting.
  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [onScroll]);
};

export default useScrollDirection;
