import { useState, useEffect, useCallback } from 'react';

/**
 * A hook that detects whether a specific key has been pressed or not.
 *
 * @param {string} targetKey
 * @param {boolean} enableDetection
 * @returns {boolean}
 */
const useKeyPressedDetector = (targetKey: string, enableDetection: boolean): boolean => {
  // keep track of whether the key has been pressed or not.
  const [keyPressed, setKeyPressed] = useState<boolean>(false);
  const downHandler = useCallback(
    ({ key }) => {
      // if the key has been pressed.
      if (key === targetKey) {
        setKeyPressed(true);
      }
    },
    [targetKey],
  );

  const upHandler = useCallback(
    ({ key }) => {
      // if released key is our target key then set to false
      if (key === targetKey) {
        setKeyPressed(false);
      }
    },
    [targetKey],
  );

  // Bind the event listener
  useEffect(() => {
    // no need to attach the listener if we disable keyboard detection.
    if (enableDetection) {
      // Bind the event listener
      window.addEventListener('keydown', downHandler);
      window.addEventListener('keyup', upHandler);
    }
    // Unbind the event listener on clean up
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [downHandler, enableDetection, upHandler]);

  return keyPressed;
};

export default useKeyPressedDetector;
