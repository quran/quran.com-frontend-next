import { useCallback, useRef } from 'react';

const DEFAULT_DURATION = 300;

/**
 * A hook that listens to long press action on mobile devices.
 * inspired by {@link https://stackoverflow.com/questions/48048957/react-long-press-event}
 *
 * @param {()=> void} callback
 * @param {number} duration
 * @returns {[() => void, () => void, () => void]}
 */
const useLongPress = (
  // callback that is invoked at the specified duration or `onEndLongPress`
  callback: () => void,
  // long press duration in milliseconds
  duration: number = DEFAULT_DURATION,
): [() => void, () => void, () => void] => {
  // used to persist the timer state
  // non zero values means the value has never been fired before
  const timerRef = useRef<number>(0);

  // clear timed callback
  const endTimer = () => {
    clearTimeout(timerRef.current || 0);
    timerRef.current = 0;
  };

  // init timer
  const onStartLongPress = useCallback(() => {
    // stop any previously set timers
    endTimer();

    // set new timeout
    timerRef.current = window.setTimeout(() => {
      callback();
      endTimer();
    }, duration);
  }, [callback, duration]);

  // determine to end timer early and invoke the callback or do nothing
  const onEndLongPress = useCallback(() => {
    // run the callback fn the timer hasn't gone off yet (non zero)
    if (timerRef.current) {
      endTimer();
      callback();
    }
  }, [callback]);

  return [onStartLongPress, onEndLongPress, endTimer];
};

export default useLongPress;
